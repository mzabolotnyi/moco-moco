<?php

return [
    'class' => 'yii\swiftmailer\Mailer',
    'htmlLayout' => '@app/mail/layouts/html',
    'transport' => [
        'class' => 'Swift_SmtpTransport',
        'host' => 'smtp.gmail.com',
        'username' => 'mocomoco.online@gmail.com',
        'password' => 'Foj5QwUC5z',
        'port' => '587',
        'encryption' => 'tls',
    ],
];
