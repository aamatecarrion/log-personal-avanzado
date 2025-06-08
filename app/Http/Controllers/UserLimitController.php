<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserLimit;
use Illuminate\Http\Request;

class UserLimitController extends Controller
{
    public function index() {

        $users = User::whereHas('user_limit')->with('user_limit')->get();
        
        return inertia('user-limits.index')->with('users', $users);
    }
    public function update(Request $request)
    {
        $validated = $request->validate([
            'can_upload_images' => 'nullable|boolean',
            'can_process_images' => 'nullable|boolean',
            'daily_upload_limit' => 'nullable|integer|min:0',
            'daily_process_limit' => 'nullable|integer|min:0',
        ]);

        UserLimit::updateOrCreate(
            ['user_id' => $request->user_id],
            $validated
        );

        return back()->with('success', 'Límites actualizados correctamente');
    }

}
