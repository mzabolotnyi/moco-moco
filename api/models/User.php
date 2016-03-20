<?php
namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\filters\RateLimitInterface;
use yii\web\IdentityInterface;
use yii\web\ServerErrorHttpException;

/**
 * User model class
 *
 * @property integer $id
 * @property string $username
 * @property string $password_hash
 * @property string $password_reset_token
 * @property string $email
 * @property string $auth_key
 * @property string $access_token
 * @property integer $status
 * @property integer $created_at
 * @property integer $updated_at
 * @property string $password write-only password
 */
class User extends OActiveRecord implements IdentityInterface, RateLimitInterface
{
    const STATUS_DELETED = 0;
    const STATUS_ACTIVE = 10;

    const ROLE_BASIC = 'basic';
    const ROLE_PREMIUM = 'premium';
    const ROLE_ADMIN = 'admin';

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'user';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['status', 'default', 'value' => self::STATUS_ACTIVE],
            ['status', 'in', 'range' => [self::STATUS_ACTIVE, self::STATUS_DELETED]],
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'username',
            'email',
        ];
    }

    /**
     * @inheritdoc
     */
    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'status' => self::STATUS_ACTIVE]);
    }

    /**
     * @inheritdoc
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        return UserAccess::findUserByAccessToken($token);
    }

    /**
     * Finds user by email
     *
     * @param string $email
     * @return static|null
     */
    public static function findByEmail($email)
    {
        return static::findOne(['email' => $email, 'status' => self::STATUS_ACTIVE]);
    }

    /**
     * Finds user by password reset token
     *
     * @param string $token password reset token
     * @return static|null
     */
    public static function findByPasswordResetToken($token)
    {
        if (!static::isPasswordResetTokenValid($token)) {
            return null;
        }

        return static::findOne([
            'password_reset_token' => $token,
            'status' => self::STATUS_ACTIVE,
        ]);
    }

    /**
     * Finds out if password reset token is valid
     *
     * @param string $token password reset token
     * @return boolean
     */
    public static function isPasswordResetTokenValid($token)
    {
        if (empty($token)) {
            return false;
        }

        $timestamp = (int)substr($token, strrpos($token, '_') + 1);
        $expire = Yii::$app->params['user.passwordResetTokenExpire'];
        return $timestamp + $expire >= time();
    }

    /**
     * @inheritdoc
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }

    /**
     * @inheritdoc
     */
    public function getAuthKey()
    {
        return $this->auth_key;
    }

    /**
     * @inheritdoc
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return boolean if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    /**
     * Generates "remember me" authentication key
     */
    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    /**
     * Generates new password reset token
     */
    public function generatePasswordResetToken()
    {
        $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
    }

    /**
     * Removes password reset token
     */
    public function removePasswordResetToken()
    {
        $this->password_reset_token = null;
    }

    /**
     * Get access token data
     * @return UserAccess|null
     * @throws ServerErrorHttpException
     */
    public function getAccess()
    {
        $access = UserAccess::generateAccess($this);

        if ($access === null) {
            throw new ServerErrorHttpException();
        }

        return $access;
    }

    /**
     * Remove access token data
     * @return bool
     */
    public function destroyAccess()
    {
        return UserAccess::destroyAccess($this);
    }

    /**
     * @inheritdoc
     */
    public function getRateLimit($request, $action)
    {
        return [100, 180]; //не более 100 запросов в течении 180 секунд (3 минут)
    }

    /**
     * @inheritdoc
     */
    public function loadAllowance($request, $action)
    {
        //get allowance from cache
        $cache = Yii::$app->cache;

        if ($cache) {
            $key = 'rate_limit_user_' . $this->getId();
            $allowance = $cache->get($key);

            if ($allowance) {
                return $allowance;
            }
        }

        //something wrong with cache - return default
        return [1, time()];
    }

    /**
     * @inheritdoc
     */
    public function saveAllowance($request, $action, $allowance, $timestamp)
    {
        //set allowance to cache
        $cache = Yii::$app->cache;

        if ($cache) {
            $key = 'rate_limit_user_' . $this->getId();
            $cache->set($key, [
                $allowance,
                $timestamp,
            ]);
        }
    }

    /**
     * Creates user profile
     * @return UserProfile
     * @throws ServerErrorHttpException
     */
    public function createProfile()
    {
        $profile = new UserProfile();
        $profile->user_id = $this->id;
        $profile->currency_id = Currency::findDefaultCurrency()->id;
        if (!$profile->save()) {
            throw new ServerErrorHttpException('Не удалось создать профиль пользователя по неизвестным причинам');
        }

        return $profile;
    }

    /**
     * Returns user profile, if it does not exist creates new
     * @return UserProfile
     */
    public function getProfile()
    {
        $profile = $this->hasOne(UserProfile::className(), ['user_id' => 'id'])->one();

        if ($profile === null) {
            $profile = $this->createProfile();
        }

        return $profile;
    }
}
