<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Modifier Groups (e.g., "Size", "Add-ons", "Preparation Style")
        Schema::create('modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('isRequired')->default(false);
            $table->integer('minSelect')->default(0);
            $table->integer('maxSelect')->default(1);
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });

        // Individual Modifiers (e.g., "Large +₱20", "Extra Cheese +₱15")
        Schema::create('item_modifiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('isActive')->default(true);
            $table->integer('sortOrder')->default(0);
            $table->foreignId('modifierGroupId')->constrained('modifier_groups')->onDelete('cascade');
            $table->timestamps();
        });

        // Link products to modifier groups
        Schema::create('product_modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('productId')->constrained('product')->onDelete('cascade');
            $table->foreignId('modifierGroupId')->constrained('modifier_groups')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_modifier_groups');
        Schema::dropIfExists('item_modifiers');
        Schema::dropIfExists('modifier_groups');
    }
};
