<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $service
    ) {}

    /**
     * GET /api/customers
     * List all customers (with optional ?search= query).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $customers = $this->service->list(
            search: $request->query('search'),
            perPage: (int) $request->query('per_page', 15)
        );

        return CustomerResource::collection($customers);
    }

    /**
     * POST /api/customers
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = $this->service->create($request->validated());

        return (new CustomerResource($customer))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/customers/{customer}
     */
    public function show(Customer $customer): CustomerResource
    {
        return new CustomerResource($customer);
    }

    /**
     * PUT /api/customers/{customer}
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $updated = $this->service->update($customer, $request->validated());

        return new CustomerResource($updated);
    }

    /**
     * DELETE /api/customers/{customer}
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $this->service->delete($customer);

        return response()->json(['message' => 'Customer deleted successfully.']);
    }
}
