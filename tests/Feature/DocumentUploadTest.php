<?php

use App\Models\Department;
use App\Models\Document;
use App\Models\PaymentVoucher;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');

    $this->department = Department::factory()->create();

    $this->officer = User::factory()->create([
        'role' => User::ROLE_FINANCE_OFFICER,
        'department_id' => $this->department->id,
    ]);

    $this->viewer = User::factory()->create([
        'role' => User::ROLE_VIEWER,
        'department_id' => $this->department->id,
    ]);

    $this->voucher = PaymentVoucher::factory()->create([
        'status' => 'draft',
        'created_by' => $this->officer->id,
        'department_id' => $this->department->id,
    ]);
});

it('attaches a document to a voucher and records it', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 200, 'application/pdf'),
        ])
        ->assertRedirect();

    $document = Document::first();

    expect($document)->not->toBeNull()
        ->and($document->name)->toBe('invoice.pdf')
        ->and($document->documentable_id)->toBe($this->voucher->id)
        ->and($document->uploaded_by)->toBe($this->officer->id);

    Storage::disk('local')->assertExists($document->path);

    $this->assertDatabaseHas('system_logs', ['action' => 'document.uploaded']);
});

it('rejects a file type that is not a document', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('script.php', 10, 'application/x-php'),
        ])
        ->assertSessionHasErrors('file');

    expect(Document::count())->toBe(0);
});

it('rejects a file over the size limit', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('huge.pdf', 20480, 'application/pdf'),
        ])
        ->assertSessionHasErrors('file');

    expect(Document::count())->toBe(0);
});

it('stops a viewer from attaching a document', function () {
    $this->actingAs($this->viewer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
        ])
        ->assertForbidden();

    expect(Document::count())->toBe(0);
});

it('does not store uploads in the public directory', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
        ]);

    // A path under public/ would be fetchable without passing authorisation.
    expect(Document::first()->path)->not->toContain('public');
});

it('lets an authorised user download an attachment', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
        ]);

    $this->actingAs($this->officer)
        ->get(route('documents.download', Document::first()))
        ->assertOk();
});

it('stops a guest downloading an attachment', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
        ]);

    auth()->logout();

    $this->get(route('documents.download', Document::first()))
        ->assertRedirect(route('login'));
});

it('removes an attachment from a draft voucher', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
        ]);

    $document = Document::first();
    $path = $document->path;

    $this->actingAs($this->officer)
        ->delete(route('documents.destroy', $document))
        ->assertRedirect();

    expect(Document::count())->toBe(0);
    Storage::disk('local')->assertMissing($path);
});

it('keeps evidence attached to a paid voucher', function () {
    $this->actingAs($this->officer)
        ->post(route('documents.store', $this->voucher), [
            'file' => UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf'),
        ]);

    $this->voucher->update(['status' => 'paid', 'paid_at' => now()]);

    $this->actingAs($this->officer)
        ->delete(route('documents.destroy', Document::first()))
        ->assertForbidden();

    expect(Document::count())->toBe(1);
});
