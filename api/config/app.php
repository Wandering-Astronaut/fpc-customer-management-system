<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

return [
    'name'            => env('APP_NAME', 'FPC Customer API'),
    'env'             => env('APP_ENV', 'production'),
    'debug'           => (bool) env('APP_DEBUG', false),
    'url'             => env('APP_URL', 'http://localhost'),
    'timezone'        => 'Asia/Manila',
    'locale'          => 'en',
    'fallback_locale' => 'en',
    'faker_locale'    => 'en_PH',
    'cipher'          => 'AES-256-CBC',
    'key'             => env('APP_KEY'),
    'maintenance'     => ['driver' => 'file'],

    'providers' => ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),

    'aliases' => Facade::defaultAliases()->merge([])->toArray(),
];
