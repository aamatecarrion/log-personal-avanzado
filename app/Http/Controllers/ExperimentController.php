<?php

namespace App\Http\Controllers;

use App\Events\TextChange;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExperimentController extends Controller
{
    public function index(){
        
        return inertia('experiments.index');
    }
    public function update(Request $request){
        
        $rawContent = $request->getContent(); // el body JSON crudo como string
        $data = json_decode($rawContent, true);
        $text = $data['text'] ?? '';

        TextChange::dispatch(
            Auth::user()->id,
            $text
        );
    }
}
