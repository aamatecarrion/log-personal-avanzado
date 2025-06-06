<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserManagementController extends Controller
{
    public function index()
    {
        // This method can be used to list users or manage user accounts
        return inertia('user-management.index', [
            'users' => User::all(),
        ]);
    }
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'is_admin' => 'boolean',
        ]);
        
        $user->update($request->only(['name', 'email', 'is_admin']));
        
        return redirect()->route('user-management.index')->with('success', 'User updated successfully.');
    }
    public function destroy($id)
    {   
        $user = User::findOrFail($id);
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }
        $user->delete();
    }

}
