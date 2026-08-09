<?php

namespace App\Services;

use Anthropic\Client;
use Anthropic\Messages\TextBlock;
use App\Models\PaymentVoucher;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * AI-assisted review and drafting, backed by the Claude API.
 *
 * Every method degrades to a null/empty result when no API key is configured
 * or the call fails — an approver must still be able to work the queue when
 * the AI is unavailable, so nothing here is allowed to break a request.
 */
class VoucherIntelligence
{
    public function __construct(private ?Client $client = null) {}

    public function isEnabled(): bool
    {
        return filled(config('anthropic.api_key'));
    }

    /**
     * Review a pending voucher against its department's payment history and
     * return findings for the approver. Returns null when unavailable.
     *
     * @return array{risk: string, summary: string, findings: array<int, string>}|null
     */
    public function reviewVoucher(PaymentVoucher $voucher): ?array
    {
        if (! $this->isEnabled()) {
            return null;
        }

        $history = PaymentVoucher::query()
            ->where('department_id', $voucher->department_id)
            ->where('status', 'paid')
            ->where('id', '!=', $voucher->id)
            ->latest('paid_at')
            ->limit(20)
            ->get(['voucher_number', 'payee_name', 'amount', 'budget_line', 'paid_at']);

        $context = $history
            ->map(fn ($v) => sprintf(
                '- %s | %s | GHS %s | %s',
                $v->voucher_number,
                $v->payee_name,
                number_format((float) $v->amount, 2),
                $v->budget_line,
            ))
            ->implode("\n");

        $prompt = <<<PROMPT
        You are reviewing a payment voucher submitted for approval at a Ghanaian
        government finance office. Flag anything an approver should check before
        releasing public funds.

        VOUCHER UNDER REVIEW
        Number: {$voucher->voucher_number}
        Payee: {$voucher->payee_name}
        Amount: GHS {$this->money($voucher->amount)}
        Budget line: {$voucher->budget_line}
        Payment method: {$voucher->payment_method}
        Description: {$voucher->description}

        RECENT PAID VOUCHERS FROM THE SAME DEPARTMENT
        {$context}

        Assess whether the amount, payee, or budget line is unusual compared to
        the department's history. Consider: amounts far above the department's
        norm, a payee that has never appeared before, a budget line that does not
        match the description, or a round-number amount that suggests an estimate
        rather than an invoice.

        Base every finding on the data above. Do not speculate about fraud or
        invent facts that are not present. If nothing stands out, say so plainly.
        PROMPT;

        $schema = [
            'type' => 'object',
            'properties' => [
                'risk' => [
                    'type' => 'string',
                    'enum' => ['low', 'medium', 'high'],
                    'description' => 'Overall attention level for the approver.',
                ],
                'summary' => [
                    'type' => 'string',
                    'description' => 'One sentence an approver can read at a glance.',
                ],
                'findings' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                    'description' => 'Specific points to check. Empty when nothing stands out.',
                ],
            ],
            'required' => ['risk', 'summary', 'findings'],
            'additionalProperties' => false,
        ];

        $result = $this->json($prompt, $schema, 'voucher review');

        if (! $result || ! isset($result['risk'], $result['summary'])) {
            return null;
        }

        return [
            'risk' => in_array($result['risk'], ['low', 'medium', 'high'], true)
                ? $result['risk']
                : 'low',
            'summary' => (string) $result['summary'],
            'findings' => array_values(array_filter(
                array_map('strval', $result['findings'] ?? []),
            )),
        ];
    }

    /**
     * Draft a memo body for a paid voucher. Returns null when unavailable.
     *
     * @return array{subject: string, body: string}|null
     */
    public function draftMemo(PaymentVoucher $voucher): ?array
    {
        if (! $this->isEnabled()) {
            return null;
        }

        $department = $voucher->department?->name ?? 'the department';
        $paidOn = $voucher->paid_at?->format('j F Y') ?? 'the payment date';

        $prompt = <<<PROMPT
        Draft an internal memorandum recording a completed payment at a Ghanaian
        government finance office.

        Voucher: {$voucher->voucher_number}
        Payee: {$voucher->payee_name}
        Amount: GHS {$this->money($voucher->amount)}
        Budget line: {$voucher->budget_line}
        Department: {$department}
        Paid on: {$paidOn}
        Purpose: {$voucher->description}

        Write in the formal register of Ghanaian public-sector correspondence:
        plain, direct, no marketing language. State what was paid, to whom, from
        which budget line, and on what authority. Three short paragraphs at most.

        Use only the facts given above. Do not invent approval references,
        cheque numbers, dates, or signatories that are not provided.
        PROMPT;

        $schema = [
            'type' => 'object',
            'properties' => [
                'subject' => [
                    'type' => 'string',
                    'description' => 'Memo subject line, under 100 characters.',
                ],
                'body' => [
                    'type' => 'string',
                    'description' => 'The memo body. Plain text paragraphs separated by blank lines.',
                ],
            ],
            'required' => ['subject', 'body'],
            'additionalProperties' => false,
        ];

        $result = $this->json($prompt, $schema, 'memo drafting');

        if (! $result || ! isset($result['subject'], $result['body'])) {
            return null;
        }

        return [
            'subject' => (string) $result['subject'],
            'body' => (string) $result['body'],
        ];
    }

    /**
     * Send one structured-output request and decode the result.
     *
     * @param  array<string, mixed>  $schema
     * @return array<string, mixed>|null
     */
    private function json(string $prompt, array $schema, string $purpose): ?array
    {
        try {
            $message = $this->client()->messages->create(
                maxTokens: 2048,
                messages: [['role' => 'user', 'content' => $prompt]],
                model: config('anthropic.model'),
                outputConfig: [
                    'format' => ['type' => 'json_schema', 'schema' => $schema],
                ],
                requestOptions: ['timeout' => config('anthropic.timeout')],
            );

            if ($message->stopReason === 'refusal') {
                Log::warning("Claude declined the {$purpose} request.");

                return null;
            }

            foreach ($message->content as $block) {
                if ($block instanceof TextBlock) {
                    $decoded = json_decode($block->text, true);

                    return is_array($decoded) ? $decoded : null;
                }
            }

            return null;
        } catch (Throwable $e) {
            // AI is an assist, never a dependency — log and let the caller
            // fall back to the manual path.
            Log::warning("Claude {$purpose} failed: {$e->getMessage()}");

            return null;
        }
    }

    private function client(): Client
    {
        return $this->client ??= new Client(apiKey: config('anthropic.api_key'));
    }

    private function money(string|float|null $amount): string
    {
        return number_format((float) $amount, 2);
    }
}
