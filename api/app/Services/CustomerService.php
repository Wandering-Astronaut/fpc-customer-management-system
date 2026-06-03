<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\ElasticsearchServiceInterface;
use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CustomerService
{
    public function __construct(
        private readonly ElasticsearchServiceInterface $elasticsearch
    ) {}

    /**
     * List all customers, with optional full-text search via Elasticsearch.
     *
     * @return LengthAwarePaginator|Collection
     */
    public function list(?string $search = null, int $perPage = 15): LengthAwarePaginator|Collection
    {
        if ($search !== null && $search !== '') {
            // Delegate to Elasticsearch, return matching IDs ordered by relevance
            $hits = $this->elasticsearch->search($search);
            $ids  = array_column($hits, 'id');

            if (empty($ids)) {
                return Customer::query()->where('id', 0)->paginate($perPage);
            }

            return Customer::query()
                ->whereIn('id', $ids)
                ->orderByRaw('array_position(ARRAY[' . implode(',', $ids) . ']::int[], id)')
                ->paginate($perPage);
        }

        return Customer::query()->latest()->paginate($perPage);
    }

    /**
     * Find a single customer by primary key.
     */
    public function find(int $id): Customer
    {
        return Customer::findOrFail($id);
    }

    /**
     * Persist a new customer and sync to Elasticsearch.
     *
     * @param array<string, string> $data
     */
    public function create(array $data): Customer
    {
        $customer = Customer::create($data);
        $this->elasticsearch->indexCustomer($customer);

        return $customer;
    }

    /**
     * Update an existing customer and sync to Elasticsearch.
     *
     * @param array<string, string> $data
     */
    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);
        $this->elasticsearch->indexCustomer($customer->fresh());

        return $customer->fresh();
    }

    /**
     * Soft-delete a customer and remove from Elasticsearch index.
     */
    public function delete(Customer $customer): void
    {
        $id = $customer->id;
        $customer->delete();
        $this->elasticsearch->deleteCustomer($id);
    }
}
