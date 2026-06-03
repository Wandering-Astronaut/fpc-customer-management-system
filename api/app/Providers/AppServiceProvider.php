<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\ElasticsearchServiceInterface;
use App\Services\ElasticsearchService;
use GuzzleHttp\Client;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind Guzzle client as a singleton
        $this->app->singleton(Client::class, fn () => new Client([
            'timeout'         => 10,
            'connect_timeout' => 5,
        ]));

        // Bind Elasticsearch contract to concrete implementation
        $this->app->bind(
            ElasticsearchServiceInterface::class,
            ElasticsearchService::class
        );
    }

    public function boot(): void
    {
        //
    }
}
