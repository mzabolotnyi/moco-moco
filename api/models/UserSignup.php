<?php

namespace app\models;

use yii\base\Model;
use Yii;
use yii\helpers\Url;

/**
 * Модель регистрации пользователя
 */
class UserSignup extends Model
{
    public $username;
    public $email;
    public $password;

    private $_user = false;

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'username' => 'Имя пользователя',
            'email' => 'Email',
            'password' => 'Пароль',
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['username', 'filter', 'filter' => 'trim'],
            ['username', 'required', 'message' => 'Не указано имя пользователя'],
            ['username', 'string', 'min' => 2, 'max' => 255],

            ['email', 'filter', 'filter' => 'trim'],
            ['email', 'required', 'message' => 'Не указан Email'],
            ['email', 'email', 'message' => 'Неверный формат Email'],
            ['email', 'string', 'min' => 2, 'max' => 255],
            ['email', 'unique', 'targetClass' => '\app\models\User', 'message' => 'Email уже используется'],

            ['password', 'required', 'message' => 'Не указан пароль'],
            ['password', 'string', 'min' => 6, 'max' => 255],
        ];
    }

    /**
     * Выполняет регистрацию нового пользователя
     * при этом отправляет на email ссылку для подтверждения регистрации
     * если не удалось отправить ссылку на подтверждение (считаем это проблемой сервера)
     * активируем пользования без подтверждения email
     *
     * @return bool
     */
    public function signup()
    {
        if ($this->validate()) {
            $user = new User();
            $user->username = $this->username;
            $user->email = $this->email;
            $user->status = $user::STATUS_ACTIVE;
            $user->setPassword($this->password);
            $user->generateAuthKey();
            if ($user->save()) {
                $this->_user = $user;
                $this->sendRegistrationMail($user);
                return true;
            }
        }

        return false;
    }

    /**
     * Отпрявляет на email письмо об успешной регистрации
     *
     * @param User $user
     * @return bool
     */
    protected function sendRegistrationMail($user)
    {
        return Yii::$app->mailer
            ->compose('@app/mail/successSignup.php', [
                'username' => $user->username,
                'email' => $user->email,
                'serviceUrl' => Yii::$app->params['serviceUrl'],
            ])
            ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->name])
            ->setTo($user->email)
            ->setSubject('Регистрация')
            ->send();
    }

    /**
     * Возвращает пользователя, найденного по email
     *
     * @return User|null
     */
    public function getUser()
    {
        if ($this->_user === false) {
            $this->_user = User::findByEmail($this->email);
        }

        return $this->_user;
    }
}
