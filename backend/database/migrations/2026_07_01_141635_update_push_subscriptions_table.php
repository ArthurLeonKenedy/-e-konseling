<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->string('subscribable_type')->default('App\\\Models\\\User');
            $table->unsignedBigInteger('subscribable_id')->nullable();
        });

        // Copy user_id to subscribable_id if we want to retain existing subscriptions
        DB::statement('UPDATE push_subscriptions SET subscribable_id = user_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['subscribable_type', 'subscribable_id']);
        });
    }
};
