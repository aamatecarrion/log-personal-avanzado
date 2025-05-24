<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConfigApiController extends Controller
{
    public function index()
    {
        $config = Config::where('user_id', Auth::user()->id)->first();

        return response()->json($config);
    }
    public function update(Request $request)
    {
        $config = Config::where('user_id', Auth::user()->id)->first();
        $config->ask_location_permission = $request->ask_location_permission;
        $config->save();
        return response()->json($config);
    }
}
