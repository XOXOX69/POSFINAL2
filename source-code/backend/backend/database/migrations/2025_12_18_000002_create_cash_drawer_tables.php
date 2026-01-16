<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cash Drawer Sessions
        Schema::create('cash_drawers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('userId')->constrained('users')->onDelete('cascade');
            $table->decimal('openingAmount', 10, 2)->default(0);
            $table->decimal('closingAmount', 10, 2)->nullable();
            $table->decimal('expectedAmount', 10, 2)->nullable();
            $table->decimal('difference', 10, 2)->nullable();
            $table->timestamp('openedAt')->useCurrent();
            $table->timestamp('closedAt')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Cash Drawer Transactions (cash in/out, sales, refunds)
        Schema::create('cash_drawer_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashDrawerId')->constrained('cash_drawers')->onDelete('cascade');
            $table->foreignId('userId')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['cash_in', 'cash_out', 'sale', 'refund'])->default('sale');
            $table->decimal('amount', 10, 2);
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('referenceId')->nullable();
            $table->string('referenceType')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_drawer_transactions');
        Schema::dropIfExists('cash_drawers');
    }
};
