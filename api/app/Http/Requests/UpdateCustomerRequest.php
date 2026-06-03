<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCustomerFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    use ValidatesCustomerFields;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareCustomerInput();
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $customerId = $this->route('customer')?->id;

        return [
            'first_name'     => ['sometimes', 'required', 'string', 'min:2', 'max:50'],
            'last_name'      => ['sometimes', 'required', 'string', 'min:2', 'max:50'],
            'email'          => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('customers', 'email')->ignore($customerId)->withoutTrashed(),
            ],
            'contact_number' => ['sometimes', 'required', 'string', 'max:11'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return $this->customerFieldMessages();
    }
}
