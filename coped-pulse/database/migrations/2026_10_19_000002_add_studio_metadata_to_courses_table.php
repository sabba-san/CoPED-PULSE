<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('academic_year')->nullable()->default('2026 / 2027')->after('status');
            $table->string('category_logo')->nullable()->default('general')->after('academic_year');
            $table->string('billing_type')->nullable()->default('free')->after('category_logo');
            $table->decimal('price', 8, 2)->nullable()->default(0.00)->after('billing_type');
            $table->string('cert_title')->nullable()->after('price');
            $table->string('cert_url', 500)->nullable()->after('cert_title');
            $table->string('bundle_title')->nullable()->after('cert_url');
            $table->string('bundle_url', 500)->nullable()->after('bundle_title');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'academic_year',
                'category_logo',
                'billing_type',
                'price',
                'cert_title',
                'cert_url',
                'bundle_title',
                'bundle_url',
            ]);
        });
    }
};
