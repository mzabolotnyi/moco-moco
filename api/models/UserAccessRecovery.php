<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\web\ServerErrorHttpException;

/**
 * Модель запроса на восстановление доступа
 */
class UserAccessRecovery extends Model
{
    public $token;

    private $_user = false;

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'token' => 'Ключ',
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['token', 'filter', 'filter' => 'trim'],
            ['token', 'required', 'message' => 'Не указан ключ'],
            ['token', 'validateToken'],
        ];
    }

    public function validateToken($attribute)
    {
        if (!$this->hasErrors()) {
            $user = $this->getUser();
            if (!$user) {
                $this->addError($attribute, 'Неверный ключ');
            }
        }
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
        $user = $this->getUser();

        if ($user) {

            $tempPassword = Yii::$app->security->generateRandomString(Yii::$app->params['tempPasswordLength']);

            $userChangePassword = new UserPasswordChange();
            $userChangePassword->password = $tempPassword;
            $userChangePassword->user = $this->getUser();
            $userChangePassword->checkOldPassword = false;

            if ($userChangePassword->changePassword()) {
                return Yii::$app->mailer
                    ->compose('@app/mail/accessRecovery.php', [
                        'username' => $user->username,
                        'password' => $tempPassword,
                        'serviceUrl' => Yii::$app->params['serviceUrl'],
                    ])
                    ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->name])
                    ->setTo($user->email)
                    ->setSubject('Временный пароль')
                    ->send();
            }
        } else {
            throw new ServerErrorHttpException();
        }
    }

    /**
     * Возвращает пользователя, найденного по ключу
     *
     * @return User|null
     */
    public function getUser()
    {
        if ($this->_user === false) {
            $this->_user = User::findByPasswordResetToken($this->token);
        }

        return $this->_user;
    }
}
