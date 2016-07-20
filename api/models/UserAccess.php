<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "user_access".
 *
 * @property integer $user_id
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
            [['user_id', 'token'], 'required'],
            [['user_id'], 'integer'],
            [['created_at'], 'safe'],
            [['token'], 'string', 'max' => 255],
            ['token', 'unique', 'targetClass' => '\app\models\UserAccess', 'message' => 'Токен уже используется'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'user_id' => 'User ID',
            'token' => 'Access Token',
        ];
    }

    /**
     * Создает access_token для пользователя,
     * если для указанного пользователя существует access_token,
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

        $access = new UserAccess;
        $access->user_id = $user->getId();;
        $access->token = self::generateToken();

        if (!$access->save()) {
            return null;
        }

        return $access;
    }

    /**
     * Удаляет access_token для пользователя
     *
     * @param User $user
     * @return bool
     */
    public static function destroyAccess($user, $token)
    {
        if ($user === null) {
            return true;
        }

        $access = self::findOne([
            'user_id' => $user->getId(),
            'token' => $token,
        ]);

        if ($access === null) {
            return true;
        }

        return $access->delete();
    }

    /**
     * Получает пользователя по ппереданному токену
     *
     * @param string $token
     * @return null|\yii\web\IdentityInterface|static
     */
    public static function findUserByAccessToken($token)
    {
        $access = self::findOne([
            'token' => $token,
        ]);

        if ($access !== null) {
            return User::findIdentity($access->user_id);
        } else {
            return null;
        }
    }

    /**
     * Генерирует случайных токен
     *
     * @return string
     */
    public static function generateToken()
    {
        // будем генерить токен пока не получим токен, который еще не используется
        do {
            $token = Yii::$app->security->generateRandomString();
            $existingAccess = self::findOne([
                'token' => $token,
            ]);
        } while ($existingAccess !== null);

        return $token;
    }
}
