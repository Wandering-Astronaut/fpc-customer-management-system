<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\CustomerInputNormalizer;
use PHPUnit\Framework\TestCase;

class CustomerInputNormalizerTest extends TestCase
{
    public function test_format_person_name_title_cases_words_and_hyphens(): void
    {
        $this->assertSame('De La Cruz', CustomerInputNormalizer::formatPersonName('de la cruz'));
        $this->assertSame('Anne-Marie', CustomerInputNormalizer::formatPersonName('anne-marie'));
    }

    public function test_normalize_philippine_mobile_from_spaced_09_input(): void
    {
        $this->assertSame(
            '09171234567',
            CustomerInputNormalizer::normalizePhilippineMobile('0917 123 4567')
        );
    }

    public function test_rejects_plus_prefix(): void
    {
        $this->assertSame('', CustomerInputNormalizer::normalizePhilippineMobile('+63 917 123 4567'));
        $this->assertFalse(CustomerInputNormalizer::isValidPhilippineMobile('+639171234567'));
    }

    public function test_strict_email_requires_domain_extension(): void
    {
        $this->assertTrue(CustomerInputNormalizer::isValidStrictEmail('user@example.com'));
        $this->assertFalse(CustomerInputNormalizer::isValidStrictEmail('user@nodot'));
    }
}
