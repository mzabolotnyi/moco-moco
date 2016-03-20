<?php

namespace app\models;

use Yii;
use yii\helpers\Url;

/**
 * This is the model class for table "user_profile".
 *
 * @property integer $user_id
 * @property integer $currency_id
 * @property string $created_at
 * @property string $updated_at
 *
 * @property Currency $currency
 * @property User $user
 */
class UserProfile extends OActiveRecord
{
    public $username;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'user_profile';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['username', 'currency_id', '!user_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id'], 'required'],
            ['username', 'filter', 'filter' => 'trim'],
            ['username', 'string', 'min' => 2, 'max' => 255],
            ['currency_id', 'integer', 'skipOnEmpty' => false],
            ['currency_id', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currency_id' => 'id']],
            ['currency_id', 'validateRelations'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'user_id' => 'User ID',
            'currency_id' => 'Currency ID',
            'username' => 'Имя пользователя',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/profile", true);
            },
            'currency' => function () {
                return $this->currency;
            },
            'username' => function () {
                return $this->user->username;
            },
            'email' => function () {
                return $this->user->email;
            },
            'roles' => function () {
                return array_merge(Yii::$app->authManager->defaultRoles, Yii::$app->authManager->getRolesByUser($this->user_id));
            },
        ];
    }

    /**
     * @inheritdoc
     */
    public function afterSave($insert, $changedAttributes)
    {
        parent::afterSave($insert, $changedAttributes);
        $this->setUsername();
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCurrency()
    {
        return $this->hasOne(Currency::className(), ['id' => 'currency_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    /**
     * Set username to user
     * @return bool
     */
    public function setUsername()
    {
        if (empty($this->username)) {
            return true;
        }

        $user = $this->user;
        $user->username = $this->username;
        return $user->save();
    }

    /**
     * Checks relationships between objects by user
     * @param string $attribute
     * @param array $params
     */
    public function validateRelations($attribute, $params)
    {
        if (!$this->hasErrors()) {

            $currency = $this->currency;
            if ($currency->user_id !== null && $currency->user_id !== $this->user_id) {
                $this->addError('currency_id', "Значение «Currency Id» неверно");
            }
        }
    }
}
