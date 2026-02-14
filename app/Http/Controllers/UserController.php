<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('users/index');
    }

    public function create(): Response
    {
        return Inertia::render('users/create');
    }

    public function edit(string $id): Response
    {
        return Inertia::render('users/edit', [
            'id' => $id,
        ]);
    }
}
