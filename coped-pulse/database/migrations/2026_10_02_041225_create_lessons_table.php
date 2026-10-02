<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('content_type', ['video', 'pdf', 'text'])->default('text');
            $table->text('content_url')->nullable();
            $table->text('content')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('duration')->nullable(); // in minutes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};