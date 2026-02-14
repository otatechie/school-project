<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class MemoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('memos/index', [
            'memos' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('memos/create');
    }
}
