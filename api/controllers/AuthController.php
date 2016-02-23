<?php

namespace app\controllers;

use app\models\User;
use app\models\UserAccess;
use app\models\UserAccessRecovery;
use app\models\UserLogin;
use app\models\UserPasswordChange;
use app\models\UserRequestAccessRecovery;
use app\models\UserSignup;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\VerbFilter;
use yii\rest\Controller;
use Yii;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;

class AuthController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();
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
     * Получение access_token по данных пользователя
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
     * Регистрация нового пользователя и получение access_token
     *
     * @return mixed
     * @throws BadRequestHttpException
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
     * Установка нового пароля
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
            if ($model->changePassword()) {
                return ['message' => 'Пароль успешно изменен'];
            } else {
                return $this->serializeData($model);
            }
        } else {
            throw new BadRequestHttpException();
        }
    }

    /**
     * Запрос на восстановление доступа
     * На почту отправляется ключ, который необходим для получения временного пароля
     * с помощью actionAccessRecovery
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
                if ($model->sendEmail()) {
                    return ['message' => 'На Вашу почту был отправлен ключ для восстановления доступа'];
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
     * Запрос на получение временного пароля
     * в теле запроса необходимо передать ключ,
     * полученный с помощью actionRequestAccessRecovery
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
                    return ['message' => 'На Вашу почту был отправлен временный пароль'];
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
     * Выход пользователя и удаление access_token
     *
     * @return array
     * @throws ServerErrorHttpException
     */
    public function actionLogout()
    {
        $user = User::findIdentity(Yii::$app->user->getId());

        if (!$user->destroyAccess()) {
            throw new ServerErrorHttpException();
        }

        return ['message' => 'Вы вышли из сервиса'];
    }
}