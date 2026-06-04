<?php

namespace App\Console\Commands;

use App\Contracts\ElasticsearchServiceInterface;
use App\Models\Customer;
use Illuminate\Console\Command;

class ReindexElasticsearchCommand extends Command
{
    protected $signature = 'elasticsearch:reindex';
    protected $description = 'Reindex all customers from PostgreSQL into Elasticsearch';

    public function __construct(private readonly ElasticsearchServiceInterface $elasticsearch)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $customers = Customer::all();
        $bar = $this->output->createProgressBar($customers->count());
        $bar->start();

        foreach ($customers as $customer) {
            $this->elasticsearch->indexCustomer($customer);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Reindexed {$customers->count()} customers.");

        return self::SUCCESS;
    }
}