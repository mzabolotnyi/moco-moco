<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\web\ServerErrorHttpException;

/**
 * Модель запроса на восстановление доступа
 */
class UserRequestAccessRecovery extends Model
{
    public $email;

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'email' => 'Email',
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['email', 'filter', 'filter' => 'trim'],
            ['email', 'required', 'message' => 'Не указан Email'],
            ['email', 'email', 'message' => 'Неверный формат Email'],
            ['email', 'exist',
                'targetClass' => '\app\models\User',
                'filter' => ['status' => User::STATUS_ACTIVE],
                'message' => 'Аккаунт не найден, проверьте правильность введенного Email'
            ],
        ];
    }

    /**
     * Отправляет на почту ключ для восстановления доступа
     *
     * @return bool
     * @throws ServerErrorHttpException
     */
    public function sendEmail()
    {
        /* @var $user User */
        $user = User::findByEmail($this->email);

        if ($user) {

            if (!User::isPasswordResetTokenValid($user->password_reset_token)) {
                $user->generatePasswordResetToken();
            }

            if ($user->save()) {
                return Yii::$app->mailer
                    ->compose('@app/mail/requestAccessRecovery.php', [
                        'username' => $user->username,
                        'passwordResetToken' => $user->password_reset_token,
                        'serviceUrl' => Yii::$app->params['serviceUrl'],
                    ])
                    ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->name])
                    ->setTo($user->email)
                    ->setSubject('Восстановление доступа')
                    ->send();
            }
        } else {
            throw new ServerErrorHttpException();
        }
    }
}
