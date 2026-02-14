<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class RolesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('roles-permissions/index');
    }

    public function edit(string $id): Response
    {
        return Inertia::render('roles-permissions/edit', [
            'id' => $id,
        ]);
    }
}
