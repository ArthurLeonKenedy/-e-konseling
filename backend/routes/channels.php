<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel untuk chat
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Presence channel untuk tracking online status
Broadcast::channel('app', function ($user) {
    return ['id' => $user->id, 'name' => $user->name, 'role' => $user->role];
});
