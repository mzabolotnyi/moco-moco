<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "user_access".
 *
 * @property integer $user_id
 * @property string $user_ip
 * @property string $token
 * @property string $created_at
 * @property string $updated_at
 */
class UserAccess extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'user_access';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'user_ip', 'token'], 'required'],
            [['user_id'], 'integer'],
            [['created_at'], 'safe'],
            [['user_ip', 'token'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'user_id' => 'User ID',
            'user_ip' => 'User IP',
            'token' => 'Access Token',
        ];
    }

    /**
     * Создает access_token для пользователя и его IP,
     * если для указанной пары ключей существует access_token,
     * то он будет перезаписан на новый
     *
     * @param User $user
     * @return UserAccess|null
     */
    public static function generateAccess($user)
    {
        if ($user === null) {
            return null;
        }

        $userId = $user->getId();
        $userIp = Yii::$app->request->getUserIP();

        if ($userIp === null) {
            return null;
        }

        $access = self::findOne([
            'user_id' => $userId,
            'user_ip' => $userIp,
        ]);

        if ($access === null) {
            $access = new UserAccess;
            $access->user_id = $userId;
            $access->user_ip = $userIp;
        }

        $access->token = Yii::$app->security->generateRandomString();

        if ($access->save()) {
            return $access;
        } else {
            return null;
        }
    }

    /**
     * Удаляет access_token для пользователя и его IP
     *
     * @param User $user
     * @return bool
     */
    public static function destroyAccess($user)
    {
        if ($user === null) {
            return true;
        }

        $userId = $user->getId();
        $userIp = Yii::$app->request->getUserIP();

        if ($userIp === null) {
            return true;
        }

        $access = self::findOne([
            'user_id' => $userId,
            'user_ip' => $userIp,
        ]);

        if ($access === null) {
            return true;
        }

        return $access->delete();
    }

    /**
     * Получает пользователя по ппереданному токену и текущему IP
     *
     * @param string $token
     * @return null|\yii\web\IdentityInterface|static
     */
    public static function findUserByAccessToken($token)
    {
        $userIp = Yii::$app->request->getUserIP();

        if ($userIp === null) {
            return null;
        }

        $access = self::findOne([
            'token' => $token,
            'user_ip' => $userIp,
        ]);

        if ($access !== null) {
            return User::findIdentity($access->user_id);
        } else {
            return null;
        }
    }
}
