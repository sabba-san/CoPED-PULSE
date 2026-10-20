<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Inertia page resolution
    |--------------------------------------------------------------------------
    |
    | This project stores its React pages in `resources/js/Pages` (capital P).
    | The package default is lowercase `js/pages`, which breaks case-sensitive
    | filesystems when asserting page components in feature tests.
    |
    */

    'pages' => [

        'ensure_pages_exist' => false,

        'paths' => [
            resource_path('js/Pages'),
        ],

        'extensions' => [
            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',
        ],

    ],

];
