<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });

        DB::statement(
            'CREATE UNIQUE INDEX customers_email_unique ON customers (email) WHERE deleted_at IS NULL'
        );
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS customers_email_unique');

        Schema::table('customers', function (Blueprint $table) {
            $table->unique('email');
        });
    }
};
