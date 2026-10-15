<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lessons predate the link/upload toggle: content_type was an
     * ENUM('video','pdf','text') with a CHECK constraint, so saving
     * 'link' or 'file' fails at the database layer. Widen to string.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE lessons MODIFY content_type VARCHAR(20) NOT NULL DEFAULT 'text'");
            return;
        }

        // SQLite cannot MODIFY columns — rebuild preserving all rows.
        $hasTranscript = Schema::hasColumn('lessons', 'transcript');
        $transcriptColumn = $hasTranscript ? ', transcript TEXT NULL' : '';
        $transcriptSelect = $hasTranscript ? ', transcript' : '';

        Schema::disableForeignKeyConstraints();

        DB::statement(
            'CREATE TABLE lessons_new (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, '
            . 'module_id INTEGER NOT NULL, title VARCHAR NOT NULL, '
            . "content_type VARCHAR(20) NOT NULL DEFAULT 'text', "
            . 'content_url TEXT NULL, content TEXT NULL'
            . $transcriptColumn
            . ', "order" INTEGER NOT NULL DEFAULT 0, duration INTEGER NULL, '
            . 'created_at DATETIME NULL, updated_at DATETIME NULL, '
            . 'FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE)'
        );
        DB::statement(
            'INSERT INTO lessons_new (id, module_id, title, content_type, content_url, content'
            . $transcriptSelect
            . ', "order", duration, created_at, updated_at) '
            . 'SELECT id, module_id, title, content_type, content_url, content'
            . $transcriptSelect
            . ', "order", duration, created_at, updated_at FROM lessons'
        );
        DB::statement('DROP TABLE lessons');
        DB::statement('ALTER TABLE lessons_new RENAME TO lessons');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE lessons SET content_type = 'text' WHERE content_type NOT IN ('video','pdf','text')");
            DB::statement("ALTER TABLE lessons MODIFY content_type ENUM('video','pdf','text') NOT NULL DEFAULT 'text'");
        }
        // SQLite: leave widened (narrowing would risk existing rows).
    }
};
