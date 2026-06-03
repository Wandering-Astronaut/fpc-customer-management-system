<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Contracts\ElasticsearchServiceInterface;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock out Elasticsearch so feature tests don't need a running ES instance
        $this->mock(ElasticsearchServiceInterface::class, function ($mock) {
            $mock->shouldReceive('indexCustomer')->andReturnNull();
            $mock->shouldReceive('deleteCustomer')->andReturnNull();
            $mock->shouldReceive('search')->andReturn([]);
        });
    }

    // ── Index ─────────────────────────────────────────────────────────────────

    public function test_list_customers_returns_paginated_response(): void
    {
        Customer::factory()->count(5)->create();

        $response = $this->getJson('/api/customers');

        $response->assertOk()
                 ->assertJsonStructure(['data', 'meta', 'links']);
    }

    public function test_list_with_search_param_delegates_to_elasticsearch(): void
    {
        $response = $this->getJson('/api/customers?search=john');

        $response->assertOk();
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function test_create_customer_returns_201(): void
    {
        $this->mock(ElasticsearchServiceInterface::class, function ($mock) {
            $mock->shouldReceive('indexCustomer')->once();
            $mock->shouldReceive('deleteCustomer')->andReturnNull();
            $mock->shouldReceive('search')->andReturn([]);
        });

        $payload = [
            'first_name'     => 'John',
            'last_name'      => 'Smith',
            'email'          => 'john.smith@test.com',
            'contact_number' => '+63 917 123 4567',
        ];

        $response = $this->postJson('/api/customers', $payload);

        $response->assertCreated()
                 ->assertJsonPath('data.email', 'john.smith@test.com');

        $this->assertDatabaseHas('customers', ['email' => 'john.smith@test.com']);
    }

    public function test_create_customer_validates_unique_email(): void
    {
        Customer::factory()->create(['email' => 'dupe@test.com']);

        $response = $this->postJson('/api/customers', [
            'first_name'     => 'Another',
            'last_name'      => 'Person',
            'email'          => 'dupe@test.com',
            'contact_number' => '09171234567',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_create_customer_requires_all_fields(): void
    {
        $response = $this->postJson('/api/customers', []);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'contact_number']);
    }

    // ── Show ──────────────────────────────────────────────────────────────────

    public function test_show_returns_customer(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/customers/{$customer->id}");

        $response->assertOk()
                 ->assertJsonPath('data.id', $customer->id);
    }

    public function test_show_returns_404_for_missing_customer(): void
    {
        $this->getJson('/api/customers/999999')->assertNotFound();
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_update_customer_persists_changes(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->putJson("/api/customers/{$customer->id}", [
            'first_name' => 'Updated',
        ]);

        $response->assertOk()
                 ->assertJsonPath('data.first_name', 'Updated');

        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'first_name' => 'Updated']);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public function test_delete_soft_deletes_customer(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->deleteJson("/api/customers/{$customer->id}");

        $response->assertOk();
        $this->assertSoftDeleted('customers', ['id' => $customer->id]);
    }
}
