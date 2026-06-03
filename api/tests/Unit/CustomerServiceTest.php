<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Contracts\ElasticsearchServiceInterface;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class CustomerServiceTest extends TestCase
{
    use RefreshDatabase;

    private CustomerService $service;
    private MockInterface $elasticsearch;

    protected function setUp(): void
    {
        parent::setUp();
        $this->elasticsearch = Mockery::mock(ElasticsearchServiceInterface::class);
        $this->service       = new CustomerService($this->elasticsearch);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_create_calls_elasticsearch_index_after_persisting(): void
    {
        $this->elasticsearch
            ->shouldReceive('indexCustomer')
            ->once()
            ->with(Mockery::type(Customer::class));

        $customer = $this->service->create([
            'first_name'     => 'Jane',
            'last_name'      => 'Doe',
            'email'          => 'jane.doe@example.com',
            'contact_number' => '+639171234567',
        ]);

        $this->assertInstanceOf(Customer::class, $customer);
        $this->assertEquals('Jane', $customer->first_name);
        $this->assertEquals('jane.doe@example.com', $customer->email);
    }

    public function test_delete_calls_elasticsearch_delete_with_correct_id(): void
    {
        $customer = Customer::factory()->create();

        $this->elasticsearch
            ->shouldReceive('deleteCustomer')
            ->once()
            ->with($customer->id);

        $this->service->delete($customer);

        $this->assertSoftDeleted('customers', ['id' => $customer->id]);
    }

    public function test_update_syncs_to_elasticsearch(): void
    {
        $customer = Customer::factory()->create();

        $this->elasticsearch
            ->shouldReceive('indexCustomer')
            ->once()
            ->with(Mockery::type(Customer::class));

        $updated = $this->service->update($customer, ['first_name' => 'Updated']);

        $this->assertEquals('Updated', $updated->first_name);
    }
}
