<?php

return [
    'class' => 'yii\swiftmailer\Mailer',
    'htmlLayout' => '@app/mail/layouts/html',
    'transport' => [
        'class' => 'Swift_SmtpTransport',
        'host' => 'smtp.gmail.com',
        'username' => 'mocomoco.online@gmail.com',
        'password' => 'max070690',
        'port' => '587',
        'encryption' => 'tls',
    ],
];
