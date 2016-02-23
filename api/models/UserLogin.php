<?php

namespace app\models;

use Yii;
use yii\base\Model;

/**
 * Модель входа пользователя (получение access_token)
 */
class UserLogin extends Model
{
    public $email;
    public $password;

    private $_user = false;

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
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
            ['email', 'filter', 'filter' => 'trim'],
            ['email', 'required', 'message' => 'Не указан Email'],
            ['email', 'email', 'message' => 'Неверный формат Email'],
            ['email', 'exist',
                'targetClass' => '\app\models\User',
                'filter' => ['status' => User::STATUS_ACTIVE],
                'message' => 'Аккаунт не найден, проверьте правильность введенного Email'
            ],
            ['password', 'required', 'message' => 'Не указан пароль'],
            ['password', 'validatePassword'],
        ];
    }

    /**
     * Проверяет корректность переданного пароль,
     * если нет - добавляет в модель ошибку
     *
     * @param string $attribute имя аттрибута, который проверяется
     */
    public function validatePassword($attribute)
    {
        if (!$this->hasErrors()) {
            $user = $this->getUser();
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, 'Неверный Email или пароль');
            }
        }
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
