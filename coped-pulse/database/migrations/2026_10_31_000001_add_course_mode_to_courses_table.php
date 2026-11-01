<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('courses', 'course_mode')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->string('course_mode', 32)->default('certification')->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('courses', 'course_mode')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->dropColumn('course_mode');
            });
        }
    }
};

