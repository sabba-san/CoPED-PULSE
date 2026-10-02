<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! Auth::check()) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Unauthenticated.'], 401)
                : redirect()->guest(route('login'));
        }

        $user = Auth::user();

        if ($role === 'staff' && ! $user->isStaff()) {
            abort(403, 'Staff access required.');
        }

        if ($role === 'learner' && ! $user->isLearner()) {
            abort(403, 'Learner access required.');
        }

        return $next($request);
    }
}