<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use App\Support\CustomerInputNormalizer;
use Illuminate\Validation\Validator;

trait ValidatesCustomerFields
{
    protected function prepareCustomerInput(): void
    {
        $merge = [];

        if ($this->has('first_name')) {
            $merge['first_name'] = CustomerInputNormalizer::formatPersonName((string) $this->input('first_name'));
        }

        if ($this->has('last_name')) {
            $merge['last_name'] = CustomerInputNormalizer::formatPersonName((string) $this->input('last_name'));
        }

        if ($this->has('email')) {
            $merge['email'] = CustomerInputNormalizer::normalizeEmail((string) $this->input('email'));
        }

        if ($this->has('contact_number')) {
            $merge['contact_number'] = CustomerInputNormalizer::normalizePhilippineMobile(
                (string) $this->input('contact_number')
            );
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->has('first_name') && ! $validator->errors()->has('first_name')) {
                $name = (string) $this->input('first_name');
                if (! preg_match(CustomerInputNormalizer::PERSON_NAME_PATTERN, $name)) {
                    $validator->errors()->add('first_name', 'Use letters, spaces, or hyphens only (2–50 characters).');
                }
            }

            if ($this->has('last_name') && ! $validator->errors()->has('last_name')) {
                $name = (string) $this->input('last_name');
                if (! preg_match(CustomerInputNormalizer::PERSON_NAME_PATTERN, $name)) {
                    $validator->errors()->add('last_name', 'Use letters, spaces, or hyphens only (2–50 characters).');
                }
            }

            if ($this->has('email') && ! $validator->errors()->has('email')) {
                $email = (string) $this->input('email');
                if (! CustomerInputNormalizer::isValidStrictEmail($email)) {
                    $validator->errors()->add(
                        'email',
                        'Enter a valid email with @, domain, and extension (e.g. name@company.com). Max 100 characters.'
                    );
                }
            }

            if ($this->has('contact_number') && ! $validator->errors()->has('contact_number')) {
                $phone = (string) $this->input('contact_number');
                if (! CustomerInputNormalizer::isValidPhilippineMobile($phone)) {
                    $validator->errors()->add(
                        'contact_number',
                        'Use 09XXXXXXXXX (11 digits, display format: 09XX XXX XXX).'
                    );
                }
            }
        });
    }

    /** @return array<string, string> */
    protected function customerFieldMessages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'first_name.max'      => 'First name must not exceed 50 characters.',
            'last_name.required'  => 'Last name is required.',
            'last_name.max'       => 'Last name must not exceed 50 characters.',
            'email.required'      => 'Email address is required.',
            'email.max'           => 'Email must not exceed 100 characters.',
            'email.unique'        => 'This email is already registered.',
            'contact_number.required' => 'Contact number is required.',
            'contact_number.max'      => 'Contact number must be 11 digits.',
        ];
    }
}
