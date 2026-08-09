<?php

/*
|--------------------------------------------------------------------------
| Individual Contributions
|--------------------------------------------------------------------------
|
| One entry per group member. Each names the area that student owned, the
| files that area covers, and the questions an examiner is most likely to ask
| about it.
|
| SUGGESTED, NOT RECORDED. This division was proposed from the shape of the
| codebase, not from a log of who committed what. Each student must confirm
| the entry describes work they actually did, and rewrite it if it does not.
| Submitting an account of work you did not do is worse than submitting a
| thinner account of work you did.
|
*/

return [
    '22424519' => [
        'name' => 'Benjamin Asare Sakyi',
        'area' => 'Payment voucher lifecycle',
        'summary' => <<<'TEXT'
I own the payment voucher: the model, its controller, and the state machine
that moves a voucher from draft through submitted, approved and paid, or back
to the preparer as returned. This is the spine of the application: every
other module either feeds it or reads from it.

The decision I spent longest on was making the transitions explicit rather
than letting any field be edited at any time. A voucher's status determines
what may happen to it next, and that rule lives in one place rather than being
re-checked in each view. Once a voucher is approved it can no longer be
edited or deleted by anyone, which is what makes the record trustworthy after
the fact.
TEXT,
        'files' => [
            'app/Models/PaymentVoucher.php',
            'app/Http/Controllers/PaymentVoucherController.php',
            'app/Policies/PaymentVoucherPolicy.php',
            'tests/Feature/VoucherWorkflowTest.php',
        ],
        'questions' => [
            'Walk through every state a voucher can be in, and what moves it between them.',
            'Why can an approved voucher not be edited? What would break if it could?',
            'Where is the rule that a preparer cannot approve their own voucher, and why there?',
        ],
    ],

    '22424615' => [
        'name' => 'Whitney Agyapomaa Bamfo',
        'area' => 'Approval routing and authority bands',
        'summary' => <<<'TEXT'
I own approval routing: the rules deciding who may release a payment of a
given size, and how a voucher reaches the right person.

The office's real constraint is that authority is bounded by amount. I
modelled this as four bands (Routine up to GHS 5,000, Standard up to 50,000,
Senior up to 250,000, and Executive without ceiling), held in one service
rather than scattered through the interface. `ApprovalRouter::canApprove` is
called from the voucher policy, so the same rule that greys out a button also
refuses the request if someone bypasses the interface entirely. Hiding a
control is a courtesy; the policy is the actual constraint.
TEXT,
        'files' => [
            'app/Services/ApprovalRouter.php',
            'app/Services/Notifier.php',
            'app/Http/Controllers/NotificationController.php',
        ],
        'questions' => [
            'What are the four bands, and what happens when a voucher exceeds the approver\'s ceiling?',
            'Why is canApprove called from the policy rather than checked in the controller?',
            'How does a voucher reach the right approver, and what happens if nobody at that level exists?',
        ],
    ],

    '22424702' => [
        'name' => 'Nicholas Mensah Ottou',
        'area' => 'General ledger and double-entry posting',
        'summary' => <<<'TEXT'
I own the ledger: the chart of accounts, the posting of paid vouchers, and the
reporting that reads from it.

Marking a voucher paid writes two rows, not one: a debit against the
expense account and a matching credit against cash or bank. The two must sum
to zero, and a test asserts that they always do. The harder problem was
idempotency: posting must happen exactly once per voucher, because a repeated
request would silently double the office's recorded expenditure. The posting
checks for existing entries before writing, so a retry is safe.
TEXT,
        'files' => [
            'app/Services/LedgerPoster.php',
            'app/Http/Controllers/LedgerController.php',
            'app/Http/Controllers/FinancialReportController.php',
            'tests/Feature/LedgerPostingTest.php',
        ],
        'questions' => [
            'Show the two rows written when a voucher is paid, and explain why they balance.',
            'What stops a voucher being posted to the ledger twice?',
            'Why double-entry at all, rather than a single expenditure column?',
        ],
    ],

    '22428013' => [
        'name' => 'Edith Ashiagbor',
        'area' => 'Interface, usability and accessibility',
        'summary' => <<<'TEXT'
I own the interface: the page layouts, the shared components, and the
usability decisions behind them.

The users are clerks and accountants under time pressure, not people who enjoy
software. That shaped everything: the dashboard shows where each voucher
stands rather than making anyone hunt for it, errors appear beside the field
that caused them as well as in a summary, and destructive actions ask for
confirmation in a proper dialog rather than a browser alert.

Two decisions I would defend specifically. Active navigation is marked by
weight and a rule, not colour alone, because colour alone excludes anyone who
cannot distinguish it. And every colour pair was checked against the WCAG AA
contrast ratio rather than judged by eye; the blue we started with failed
against white text, which was not obvious until it was measured.
TEXT,
        'files' => [
            'resources/js/layouts/',
            'resources/js/components/',
            'resources/css/app.css',
        ],
        'questions' => [
            'Which usability heuristics did you apply, and where can you point to each in the interface?',
            'How does the interface know what to hide from a user, and why is that not security?',
            'What is the contrast requirement, and how did you verify the palette meets it?',
        ],
    ],

    '22424582' => [
        'name' => 'Clement Danso Boateng',
        'area' => 'Authorization, policies and security testing',
        'summary' => <<<'TEXT'
I own authorization: the policies deciding who may do what, and the test suite
that tries to break them.

The suite is written from the attacker's side. Each test signs in as one user
and attempts something it should not be allowed (reading another department's
voucher, promoting itself to administrator, deleting a paid record) and
asserts that the attempt fails. Writing those tests before the policies
existed showed how much authority was being decided in the browser, where a
user can simply ignore it.

Every control now resolves to a policy method on the server. The interface
reads the same policies through Inertia's shared props, so what a user sees
and what the server permits come from one source and cannot drift apart.
TEXT,
        'files' => [
            'app/Policies/',
            'app/Http/Middleware/EnsureUserIsActive.php',
            'tests/Feature/SecurityTest.php',
            'tests/Feature/PermissionVisibilityTest.php',
        ],
        'questions' => [
            'Pick any policy and explain what it permits, to whom, and why.',
            'Why is hiding a button not access control?',
            'How does deactivating a user take effect on someone already signed in?',
        ],
    ],

    '22424559' => [
        'name' => 'Augustine Chinful',
        'area' => 'AI integration and automated checks',
        'summary' => <<<'TEXT'
I own the emerging-technology component: the Claude API integration and the
deterministic checks that run alongside it.

The division between them is the point. Drafting a memo and summarising a
voucher for review are language tasks, and a language model does them well.
Detecting a duplicate payment is not; it is a query. Spotting an unusual
amount is a standard deviation. Matching a description to a budget line is
keyword scoring. I implemented those three as arithmetic in `VoucherChecks`
because each can then explain itself in one sentence, which matters when the
output is shown to someone deciding whether to release public money.

Every AI call is optional and outside the critical path. If the key is
missing or the service is slow, the feature is absent rather than broken, and
no approval or payment depends on it.
TEXT,
        'files' => [
            'app/Services/VoucherIntelligence.php',
            'app/Services/VoucherChecks.php',
            'tests/Feature/VoucherChecksTest.php',
        ],
        'questions' => [
            'Why are the three checks arithmetic rather than machine learning?',
            'What happens to the application if the Claude API is unavailable?',
            'How does the outlier check work, and why does it need five prior vouchers?',
        ],
    ],

    '22414246' => [
        'name' => 'Afrakumah Dapaah',
        'area' => 'Audit trail, documents and deployment',
        'summary' => <<<'TEXT'
I own the audit trail, document handling, and the deployment.

The audit trail is append-only: every state change writes who acted, what they
did, and when, and nothing in the application can edit or delete those rows.
That is what allows the office to answer an auditor's question months later.
Supporting documents are stored outside the public directory and served only
through a controller that checks authorization first, so an unguessable URL is
never the thing protecting an invoice.

Deployment was where the most instructive failures happened. A container that
reports itself healthy while the proxy returns 502 gives you almost nothing to
work with, so I made the failures loud: a startup banner naming what broke, an
extension check that fails the build rather than warning on every request, and
a health endpoint that answers without touching the database, so a database
fault and a routing fault produce different symptoms.
TEXT,
        'files' => [
            'app/Services/AuditLogger.php',
            'app/Http/Controllers/DocumentController.php',
            'Dockerfile',
            'docker/entrypoint.sh',
            'docs/DEPLOYMENT.md',
        ],
        'questions' => [
            'What makes the audit trail trustworthy? What stops someone editing it?',
            'Why are uploaded documents not served directly from the public directory?',
            'Describe a deployment failure you diagnosed and how you found the cause.',
        ],
    ],
];
