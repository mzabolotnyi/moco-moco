<?php

return [
    'enablePrettyUrl' => true,
    'showScriptName' => false,
    'rules' => [
        // user profile
        [
            'class' => 'yii\rest\UrlRule',
            'pluralize' => false,
            'controller' => [
                'profile',
            ],
            'patterns' => [
                'PUT,PATCH' => 'update',
                'GET' => 'view',
            ],
        ],
        // currency
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => [
                'currency',
            ],
            'tokens' => [
                '{id}' => '<id:\\d[\\d,]*>',
                '{date}' => '<date>',
            ],
            'extraPatterns' => [
                'GET {id}/rates' => 'get-rates',
                'GET {id}/rates/{date}' => 'get-rates',
                'POST {id}/rates/{date}' => 'create-rate',
                'PUT,PATCH {id}/rates/{date}' => 'update-rate',
                'DELETE {id}/rates' => 'delete-rates',
                'DELETE {id}/rates/{date}' => 'delete-rates',
            ],
        ],
        // account
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => [
                'account',
            ],
            'tokens' => [
                '{id}' => '<id:\\d[\\d,]*>',
                '{currency-id}' => '<currencyId:\\d[\\d,]*>',
            ],
            'extraPatterns' => [
                'GET {id}/currencies' => 'get-currencies',
                'GET {id}/transactions' => 'get-transactions',
                'GET balance' => 'get-balance',
                'GET {id}/balance' => 'get-balance',
                'GET {id}/balance/{currency-id}' => 'get-balance',
                'POST {id}/balance/{currency-id}' => 'adjust-balance',
                'PUT,PATCH {id}/currencies/{currency-id}' => 'bind-currency',
                'DELETE {id}/currencies/{currency-id}' => 'unbind-currency',
                'DELETE {id}/transactions' => 'delete-transactions',
            ],
        ],
        // tag
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => [
                'tag',
            ],
            'extraPatterns' => [
                'GET {id}/transactions' => 'get-transactions',
                'DELETE {id}/transactions' => 'delete-transactions',
            ],
        ],
        // transaction
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => [
                'transaction',
            ],
        ],
    ],
];
