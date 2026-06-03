<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Customer;

interface ElasticsearchServiceInterface
{
    /**
     * Ensure the customers index exists with correct mappings.
     */
    public function setupIndex(): void;

    /**
     * Index (create/update) a customer document.
     */
    public function indexCustomer(Customer $customer): void;

    /**
     * Remove a customer document.
     */
    public function deleteCustomer(int $id): void;

    /**
     * Search customers by name and/or email.
     *
     * @return array<int, array<string, mixed>>
     */
    public function search(string $query): array;
}
