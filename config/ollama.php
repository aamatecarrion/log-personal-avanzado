<?php

return [

    'connections' => [
        [
            'host' => env('OLLAMA_HOST', '127.0.0.1'),
            'port' => env('OLLAMA_PORT', 11434),
            'model' => env('OLLAMA_MODEL', 'gemma3'),
        ]
    ],

];