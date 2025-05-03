<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/records')->assertRedirect('/login');
});

test('authenticated users can visit the records', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/records')->assertOk();
});