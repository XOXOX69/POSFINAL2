<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cfd_advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('badge')->nullable();
            $table->text('description')->nullable();
            $table->string('price')->nullable();
            $table->enum('media_type', ['image', 'video', 'text'])->default('text');
            $table->string('media_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->integer('duration')->default(5000); // Duration in milliseconds
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cfd_advertisements');
    }
};
