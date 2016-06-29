<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;

/**
 * Модель напоминания пароля
 */
class UserPasswordChange extends Model
{
    public $oldPassword;
    public $password;

    /**
     * @var bool|User
     */
    public $user = false;

    public $checkOldPassword = true;

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['oldPassword', 'password'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'password' => 'Пароль',
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['password', 'required', 'message' => 'Не указан пароль'],
            ['password', 'string', 'min' => 6, 'max' => 255],
        ];
    }

    /**
     * Устанавливает новый пароль
     *
     * @return bool
     * @throws ServerErrorHttpException
     * @throws BadRequestHttpException
     */
    public function changePassword()
    {
        if ($this->validate()) {

            if ($this->user === false) {
                $this->user = Yii::$app->user->getIdentity(false);
            }

            if ($this->user !== null) {

                if ($this->checkOldPassword && !$this->user->validatePassword($this->oldPassword)) {
                    throw new BadRequestHttpException("Текущий пароль указан неверно");
                }

                if ($this->user->validatePassword($this->password)) {
                    throw new BadRequestHttpException("Нельзя установить пароль, который совпадает с текущим");
                }

                $this->user->setPassword($this->password);

                return $this->user->save(false);

            } else {
                throw new ServerErrorHttpException("Не удалось определить пользователя");
            }
        }

        return false;
    }
}
