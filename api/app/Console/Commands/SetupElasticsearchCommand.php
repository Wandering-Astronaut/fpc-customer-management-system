<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Contracts\ElasticsearchServiceInterface;
use Illuminate\Console\Command;

class SetupElasticsearchCommand extends Command
{
    protected $signature   = 'elasticsearch:setup';
    protected $description = 'Create the customers index in Elasticsearch if it does not exist.';

    public function handle(ElasticsearchServiceInterface $elasticsearch): int
    {
        $this->info('[ES] Setting up index...');
        $elasticsearch->setupIndex();
        $this->info('[ES] Done.');

        return self::SUCCESS;
    }
}
