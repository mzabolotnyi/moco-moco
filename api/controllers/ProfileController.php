<?php

namespace app\controllers;

use app\models\User;
use Yii;
use yii\filters\AccessControl;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\RateLimiter;
use yii\rest\Controller;
use yii\web\ServerErrorHttpException;

class ProfileController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = ['class' => HttpBearerAuth::className()];
        $behaviors['accessControl'] = [
            'class' => AccessControl::className(),
            'rules' => [
                // allow users with basic role and higher
                [
                    'allow' => true,
                    'roles' => [User::ROLE_BASIC],
                ],
            ],
        ];
//        $behaviors['rateLimiter'] = [
//            'class' => RateLimiter::className(),
//            'errorMessage' => 'Превышен лимит запросов, повторите действие через несколько минут',
//        ];

        return $behaviors;
    }

    public function actionView()
    {
        /* @var User $user */
        $user = Yii::$app->user->getIdentity();
        $model = $user->getProfile();

        return $model;
    }

    public function actionUpdate()
    {
        /* @var User $user */
        $user = Yii::$app->user->getIdentity();
        $model = $user->getProfile();

        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        if ($model->save() === false && !$model->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось изменить профиль по неизвестным причинам');
        }

        return $model;
    }
}