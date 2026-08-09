<?php

test('the root url sends guests to login', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});
