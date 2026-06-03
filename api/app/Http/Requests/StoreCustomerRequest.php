<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCustomerFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
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
        return [
            'first_name'     => ['required', 'string', 'min:2', 'max:50'],
            'last_name'      => ['required', 'string', 'min:2', 'max:50'],
            'email'          => [
                'required',
                'string',
                'max:100',
                Rule::unique('customers', 'email')->withoutTrashed(),
            ],
            'contact_number' => ['required', 'string', 'max:11'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return $this->customerFieldMessages();
    }
}
