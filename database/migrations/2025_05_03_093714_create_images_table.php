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
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('record_id')->unique()->references('id')->on('records')->onDelete('cascade');
            $table->text('generated_description')->nullable();
            $table->decimal('file_latitude', 10, 8)->nullable();
            $table->decimal('file_longitude', 11, 8)->nullable();
            $table->timestamp('file_date')->nullable();
            $table->string('original_filename');
            $table->string('image_path');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
