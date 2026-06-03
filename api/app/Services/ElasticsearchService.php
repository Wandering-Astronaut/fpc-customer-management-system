<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\ElasticsearchServiceInterface;
use App\Models\Customer;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Log;

class ElasticsearchService implements ElasticsearchServiceInterface
{
    private readonly Client $client;
    private readonly string $baseUrl;
    private readonly string $index;

    public function __construct(Client $client)
    {
        $this->client  = $client;
        $this->baseUrl = rtrim(config('elasticsearch.host'), '/');
        $this->index   = config('elasticsearch.index', 'customers');
    }

    /**
     * Ensure the customers index exists with correct field mappings.
     */
    public function setupIndex(): void
    {
        try {
            $this->client->get("{$this->baseUrl}/{$this->index}");
            Log::info('[ES] Index already exists', ['index' => $this->index]);
        } catch (ClientException $e) {
            if ($e->getResponse()->getStatusCode() === 404) {
                $this->createIndex();
            } else {
                throw $e;
            }
        }
    }

    /**
     * Index (upsert) a single customer document.
     */
    public function indexCustomer(Customer $customer): void
    {
        $this->client->put(
            "{$this->baseUrl}/{$this->index}/_doc/{$customer->id}",
            [
                'json' => [
                    'id'             => $customer->id,
                    'first_name'     => $customer->first_name,
                    'last_name'      => $customer->last_name,
                    'full_name'      => $customer->full_name,
                    'email'          => $customer->email,
                    'contact_number' => $customer->contact_number,
                    'updated_at'     => $customer->updated_at?->toIso8601String(),
                ],
            ]
        );

        Log::info('[ES] Customer indexed', ['id' => $customer->id]);
    }

    /**
     * Delete a customer document from the index.
     */
    public function deleteCustomer(int $id): void
    {
        try {
            $this->client->delete("{$this->baseUrl}/{$this->index}/_doc/{$id}");
            Log::info('[ES] Customer deleted from index', ['id' => $id]);
        } catch (ClientException $e) {
            // Document may not exist – log but don't fail the request
            Log::warning('[ES] Delete skipped (not found)', ['id' => $id]);
        }
    }

    /**
     * Search names and email (partial / prefix friendly, with light fuzzy matching).
     *
     * @return array<int, array<string, mixed>>
     */
    public function search(string $query): array
    {
        $term = trim($query);
        if ($term === '') {
            return [];
        }

        $emailWildcard = '*'.$this->escapeWildcard(mb_strtolower($term, 'UTF-8')).'*';

        $payload = [
            'query' => [
                'bool' => [
                    'should' => [
                        // Prefix on name fields, e.g. "joh" → John
                        [
                            'multi_match' => [
                                'query'  => $term,
                                'fields' => ['first_name', 'last_name', 'full_name'],
                                'type'   => 'bool_prefix',
                            ],
                        ],
                        // Whole-word + typo tolerance on names
                        [
                            'multi_match' => [
                                'query'     => $term,
                                'fields'    => ['first_name', 'last_name', 'full_name'],
                                'type'      => 'best_fields',
                                'fuzziness' => 'AUTO',
                            ],
                        ],
                        // Substring on email, e.g. "gmail" or "juan@"
                        [
                            'wildcard' => [
                                'email' => [
                                    'value'            => $emailWildcard,
                                    'case_insensitive' => true,
                                ],
                            ],
                        ],
                    ],
                    'minimum_should_match' => 1,
                ],
            ],
            'size' => 100,
        ];

        $response = $this->client->post(
            "{$this->baseUrl}/{$this->index}/_search",
            ['json' => $payload]
        );

        $body = json_decode((string) $response->getBody(), true);

        return array_map(
            fn (array $hit) => $hit['_source'],
            $body['hits']['hits'] ?? []
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function escapeWildcard(string $value): string
    {
        return addcslashes($value, '\\*?');
    }

    private function createIndex(): void
    {
        $this->client->put(
            "{$this->baseUrl}/{$this->index}",
            [
                'json' => [
                    'mappings' => [
                        'properties' => [
                            'id'             => ['type' => 'integer'],
                            'first_name'     => ['type' => 'text', 'analyzer' => 'standard'],
                            'last_name'      => ['type' => 'text', 'analyzer' => 'standard'],
                            'full_name'      => ['type' => 'text', 'analyzer' => 'standard'],
                            'email'          => ['type' => 'keyword'],
                            'contact_number' => ['type' => 'keyword'],
                            'updated_at'     => ['type' => 'date'],
                        ],
                    ],
                ],
            ]
        );

        Log::info('[ES] Index created', ['index' => $this->index]);
    }
}
