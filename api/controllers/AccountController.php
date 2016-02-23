<?php

namespace app\controllers;

class AccountController extends ApiActiveController
{
    public $modelClass = 'app\models\Account';
    protected $controlUserAccess = true;
}