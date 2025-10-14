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
        Schema::create("taxis_zones", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table->text("Borough");
            $table->text("zone");
            $table->text("service_zone");
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("taxis_zones");
    }
};
