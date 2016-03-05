<?php

return [
    'enablePrettyUrl' => true,
    'showScriptName' => false,
    'rules' => [
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
                'DELETE {id}/rates' => 'delete-rate',
                'DELETE {id}/rates/{date}' => 'delete-rate',
            ],
        ],
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
                'PUT,PATCH {id}/currencies/{currency-id}' => 'bind-currency',
                'DELETE {id}/currencies/{currency-id}' => 'unbind-currency',
            ],
        ],
        [
            'class' => 'yii\rest\UrlRule',
            'controller' => [
                'tag',
            ],
            'tokens' => [
                '{id}' => '<id:\\d[\\d,]*>',
            ],
            'extraPatterns' => [
            ],
        ],
    ],
];
