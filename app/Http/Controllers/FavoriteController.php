<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FavoriteController extends Controller
{
    public function index()
    {
        return inertia('favorites.index', [
            'favorites' => Favorite::where('user_id', Auth::id())->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('favorites')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
        ]);

        Favorite::create([
            'user_id' => Auth::id(),
            'title' => $request->input('title'),
        ]);

        return redirect()->back()->with('success', 'Favorite added successfully.');
    }

    public function destroy($id)
    {
        $favorite = Favorite::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->firstOrFail();

        $favorite->delete();

        return redirect()->back()->with('success', 'Favorite removed successfully.');
    }

}
