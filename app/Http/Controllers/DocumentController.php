<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\PaymentVoucher;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    /** Formats a preparer would actually attach to a voucher. */
    private const ALLOWED_MIMES = 'pdf,jpg,jpeg,png,doc,docx,xls,xlsx';

    private const MAX_KILOBYTES = 10240;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Document::class);

        $documents = Document::query()
            ->with(['uploader:id,name', 'documentable'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'filters' => $request->only(['search']),
            'canUpload' => $request->user()->can('create', Document::class),
        ]);
    }

    /**
     * Attach a supporting document to a voucher.
     *
     * The file is stored outside the public directory and served only through
     * {@see download()}, so a document is never reachable by guessing a URL.
     */
    public function store(Request $request, PaymentVoucher $voucher): RedirectResponse
    {
        $this->authorize('create', Document::class);

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:'.self::ALLOWED_MIMES,
                'max:'.self::MAX_KILOBYTES,
            ],
        ], [
            'file.mimes' => 'Attach a PDF, image, Word or Excel file.',
            'file.max' => 'Files must be 10MB or smaller.',
        ]);

        $file = $validated['file'];

        $path = $file->store("vouchers/{$voucher->id}", 'local');

        $document = Document::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'documentable_type' => PaymentVoucher::class,
            'documentable_id' => $voucher->id,
            'uploaded_by' => $request->user()->id,
        ]);

        AuditLogger::record(
            'document.uploaded',
            "Attached {$document->name} to voucher {$voucher->voucher_number}.",
            $voucher,
        );

        return back()->with('success', "{$document->name} was attached.");
    }

    /**
     * Stream a document to an authorised user.
     */
    public function download(Document $document): StreamedResponse
    {
        $this->authorize('view', $document);

        abort_unless(Storage::disk('local')->exists($document->path), 404);

        return Storage::disk('local')->download($document->path, $document->name);
    }

    public function destroy(Document $document): RedirectResponse
    {
        $this->authorize('delete', $document);

        $name = $document->name;

        Storage::disk('local')->delete($document->path);
        $document->delete();

        AuditLogger::record('document.deleted', "Removed the attachment {$name}.");

        return back()->with('success', "{$name} was removed.");
    }
}
