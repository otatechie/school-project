<?php

/*
|--------------------------------------------------------------------------
| Demonstration Accounts
|--------------------------------------------------------------------------
|
| The sample accounts created by the database seeder. The sign-in page reads
| this list when demonstration mode is on, so the credentials shown on screen
| and the ones actually seeded can never drift apart.
|
| These are demonstration accounts for an assessed capstone project. A real
| deployment would seed no users at all and create the first administrator
| through a one-time setup step.
|
*/

return [
    'password' => env('DEMO_PASSWORD', 'password'),

    'superadmin' => [
        'name' => 'Nana Kwame Asiedu',
        'email' => 'superadmin@govpay.test',
        'staff_id' => 'AMEO-0000',
        'position' => 'Head of ICT and Systems',
    ],

    /*
     * Shown beneath the sign-in form so an assessor can switch roles and see
     * how authority changes what the system allows.
     */
    'accounts' => [
        ['email' => 'superadmin@govpay.test', 'label' => 'Superadmin'],
        ['email' => 'accountant@govpay.test', 'label' => 'Accountant'],
        ['email' => 'approver@govpay.test', 'label' => 'Approver'],
        ['email' => 'senior@govpay.test', 'label' => 'Senior approver'],
        ['email' => 'auditor@govpay.test', 'label' => 'Auditor'],
    ],
];
