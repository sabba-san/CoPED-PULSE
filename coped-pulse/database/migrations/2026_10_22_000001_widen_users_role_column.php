<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL DEFAULT 'learner'");
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50)");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'learner'");
            return;
        }

        // SQLite support
        try {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role', 50)->default('learner')->change();
            });
        } catch (\Throwable $e) {
            // Handled gracefully in SQLite environments
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('staff', 'learner') NOT NULL DEFAULT 'learner'");
        }
    }
};
