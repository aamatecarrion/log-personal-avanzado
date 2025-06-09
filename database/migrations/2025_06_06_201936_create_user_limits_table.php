<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('user_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->boolean('can_upload_images')->default(false);
            $table->boolean('can_process_images')->default(false);
            
            $table->integer('daily_upload_limit')->default(10)->nullable();
            $table->integer('daily_process_limit')->default(20)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_limits');
    }
};
