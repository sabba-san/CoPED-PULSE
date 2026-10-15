<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class GoalController extends Controller
{
    public function update(Request $request)
    {
        if (! Schema::hasColumn('users', 'daily_goal_items')) {
            return back()->with('error', 'Daily goals are unavailable right now. Please ask an administrator to run migrations.');
        }

        $validated = $request->validate([
            'daily_goal_items' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $request->user()->update($validated);

        return back();
    }
}
