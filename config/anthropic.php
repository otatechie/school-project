<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Anthropic API
    |--------------------------------------------------------------------------
    |
    | AI-assisted features (voucher anomaly review and memo drafting) call the
    | Claude API. When no key is configured every AI feature degrades to a
    | clearly-labelled "unavailable" state rather than failing the request.
    |
    */

    'api_key' => env('ANTHROPIC_API_KEY'),

    'model' => env('ANTHROPIC_MODEL', 'claude-opus-5'),

    // Keep AI calls well inside the request timeout.
    'timeout' => (int) env('ANTHROPIC_TIMEOUT', 45),

    'enabled' => (bool) env('ANTHROPIC_API_KEY', false),
];
