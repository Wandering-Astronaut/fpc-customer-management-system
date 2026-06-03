<?php

declare(strict_types=1);

namespace App\Support;

final class CustomerInputNormalizer
{
    /** Letters, spaces, hyphens (Unicode). */
    public const PERSON_NAME_PATTERN = '/^[\p{L}\s\-]+$/u';

    public static function formatPersonName(string $name): string
    {
        $name = trim(preg_replace('/\s+/u', ' ', $name) ?? '');
        $parts = preg_split('/([\s\-])/u', $name, -1, PREG_SPLIT_DELIM_CAPTURE);
        $result = '';

        foreach ($parts as $part) {
            if ($part === ' ' || $part === '-') {
                $result .= $part;
                continue;
            }
            if ($part === '') {
                continue;
            }
            $lower = mb_strtolower($part, 'UTF-8');
            $result .= mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8')
                . mb_substr($lower, 1, null, 'UTF-8');
        }

        return $result;
    }

    public static function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email), 'UTF-8');
    }

    /**
     * Strip spaces/dashes and store as 09XXXXXXXXX (11 digits).
     */
    public static function normalizePhilippineMobile(string $input): string
    {
        if (str_contains($input, '+')) {
            return '';
        }

        $digits = preg_replace('/\D/', '', trim($input)) ?? '';

        if (preg_match('/^09\d{9}$/', $digits)) {
            return $digits;
        }

        // Legacy +639… values from older saves
        if (preg_match('/^639\d{9}$/', $digits)) {
            return '0' . substr($digits, 2);
        }

        return $digits;
    }

    public static function isValidPhilippineMobile(string $phone): bool
    {
        return (bool) preg_match('/^09\d{9}$/', self::normalizePhilippineMobile($phone));
    }

    public static function isValidStrictEmail(string $email): bool
    {
        if ($email === '' || mb_strlen($email) > 100) {
            return false;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $parts = explode('@', $email, 2);
        if (count($parts) !== 2) {
            return false;
        }

        $domain = $parts[1];

        return (bool) preg_match('/\.[a-z]{2,}$/i', $domain);
    }
}
