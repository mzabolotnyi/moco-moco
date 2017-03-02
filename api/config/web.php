<?php

$params = require(__DIR__ . '/params.php');

$config = [
    'id' => 'basic',
    'name' => 'MOCO-MOCO',
    'version' => '1.0.0',
    'language' => 'ru-RU',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'components' => [
        'request' => require(__DIR__ . '/components/request.php'),
        'cache' => require(__DIR__ . '/components/cache.php'),
        'user' => require(__DIR__ . '/components/user.php'),
        'authManager' => require(__DIR__ . '/components/authManager.php'),
        'errorHandler' => require(__DIR__ . '/components/errorHandler.php'),
        'mailer' => require(__DIR__ . '/components/mailer.php'),
        'log' => require(__DIR__ . '/components/log.php'),
        'db' => require(__DIR__ . '/db.php'),
        'urlManager' => require(__DIR__ . '/components/urlManager.php'),
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        'generators' => [
            'crud' => ['class' => 'dee\gii\generators\crud\Generator'],
            'angular' => ['class' => 'dee\gii\generators\angular\Generator'],
            'mvc' => ['class' => 'dee\gii\generators\mvc\Generator'],
            'migration' => ['class' => 'dee\gii\generators\migration\Generator'],
        ]
    ];
}

return $config;
