<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Customer;
use App\Services\ElasticsearchService;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use Tests\TestCase;

class ElasticsearchServiceTest extends TestCase
{
    private function makeService(MockHandler $mockHandler): ElasticsearchService
    {
        $handlerStack = HandlerStack::create($mockHandler);
        $client       = new Client(['handler' => $handlerStack]);

        return new ElasticsearchService($client);
    }

    public function test_index_customer_sends_put_request(): void
    {
        $mock = new MockHandler([
            new Response(200, [], json_encode(['result' => 'created'])),
        ]);

        $service  = $this->makeService($mock);
        $customer = Customer::factory()->make(['id' => 1]);

        // Should not throw
        $service->indexCustomer($customer);

        $this->assertCount(0, $mock); // request was consumed
    }

    public function test_search_returns_hits_sources(): void
    {
        $body = json_encode([
            'hits' => [
                'hits' => [
                    ['_source' => ['id' => 1, 'first_name' => 'Jane', 'email' => 'jane@example.com']],
                ],
            ],
        ]);

        $mock    = new MockHandler([new Response(200, [], $body)]);
        $service = $this->makeService($mock);

        $results = $service->search('jane');

        $this->assertCount(1, $results);
        $this->assertEquals('Jane', $results[0]['first_name']);
    }

    public function test_setup_index_creates_index_when_not_found(): void
    {
        $mock = new MockHandler([
            // First call: GET index -> 404
            new \GuzzleHttp\Exception\ClientException(
                'Not found',
                new \GuzzleHttp\Psr7\Request('GET', '/customers'),
                new Response(404)
            ),
            // Second call: PUT index -> 200
            new Response(200, [], json_encode(['acknowledged' => true])),
        ]);

        $service = $this->makeService($mock);

        // Should not throw
        $service->setupIndex();

        $this->assertCount(0, $mock); // Both requests consumed
    }
}
