<?php

return [

    'connections' => [
        [
            'host' => env('OLLAMA_HOST', '127.0.0.1'),
            'port' => env('OLLAMA_PORT', 11434),
            'model' => env('OLLAMA_MODEL', 'gemma3'),
        ],
        [
            'host' => env('OLLAMA_HOST_2', '127.0.0.1'),
            'port' => env('OLLAMA_PORT', 11434),
            'model' => env('OLLAMA_MODEL_2', 'qwen2.5vl:3b'),
        ]
    ],

];