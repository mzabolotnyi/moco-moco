<?php

namespace app\controllers;

use app\models\IpRateLimiter;
use app\models\User;
use app\models\UserAccess;
use app\models\UserAccessRecovery;
use app\models\UserLogin;
use app\models\UserPasswordChange;
use app\models\UserRequestAccessRecovery;
use app\models\UserSignup;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\RateLimiter;
use yii\filters\VerbFilter;
use yii\rest\Controller;
use Yii;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;

class AuthController extends Controller
{
    public $defaultAction = 'login';

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['rateLimiter'] = [
            'class' => RateLimiter::className(),
            'errorMessage' => 'Превышен лимит запросов',
            'user' => new IpRateLimiter(),
        ];
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::className(),
            'only' => ['logout', 'change-password'],
        ];
        $behaviors['verbs'] = [
            'class' => VerbFilter::className(),
            'actions' => [
                '*' => ['post'],
            ],
        ];

        return $behaviors;
    }

    /**
     * Getting access token
     *
     * @return UserAccess|mixed|null
     * @throws BadRequestHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionLogin()
    {
        $model = new UserLogin();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '')) {
            if ($model->validate()) {
                return $model->getUser()->getAccess();
            } else {
                return $this->serializeData($model);
            }
        } else {
            throw new BadRequestHttpException();
        }
    }

    /**
     * Sign in new user and getting access token
     *
     * @return UserAccess|mixed|null
     * @throws BadRequestHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionSignup()
    {
        $model = new UserSignup();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '')) {
            if ($model->signup()) {
                return $model->getUser()->getAccess();
            } else {
                return $this->serializeData($model);
            }
        } else {
            throw new BadRequestHttpException();
        }
    }

    /**
     * Setting new password
     *
     * @return array|mixed
     * @throws BadRequestHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionChangePassword()
    {
        $model = new UserPasswordChange();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '')) {
            if (!$model->changePassword()) {
                return $this->serializeData($model);
            }
        } else {
            throw new BadRequestHttpException();
        }
    }

    /**
     * Request for the access recovery
     * Reset token sends to user's email
     *
     * @return array|mixed
     * @throws BadRequestHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionRequestAccessRecovery()
    {
        $model = new UserRequestAccessRecovery();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '')) {
            if ($model->validate()) {
                if (!$model->sendEmail()) {
                    throw new ServerErrorHttpException("Не удалось отправить письмо с ключом");
                }
            } else {
                return $this->serializeData($model);
            }
        } else {
            throw new BadRequestHttpException();
        }
    }

    /**
     * Request for a temporary password
     * In request body must be reset token
     *
     * @return array|mixed
     * @throws BadRequestHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionAccessRecovery()
    {
        $model = new UserAccessRecovery();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '')) {
            if ($model->validate()) {
                if ($model->sendEmail()) {
                    $model->getUser()->removePasswordResetToken();
                    $model->getUser()->save();
                } else {
                    throw new ServerErrorHttpException("Не удалось отправить письмо с ключом");
                }
            } else {
                return $this->serializeData($model);
            }
        } else {
            throw new BadRequestHttpException();
        }
    }

    /**
     * Remove access token
     *
     * @return array
     * @throws ServerErrorHttpException
     */
    public function actionLogout()
    {
        /**
         * @var $user User
         */
        $user = Yii::$app->user->getIdentity(false);

        if (!$user->destroyAccess()) {
            throw new ServerErrorHttpException();
        }
    }
}