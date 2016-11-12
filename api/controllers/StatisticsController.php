<?php

namespace app\controllers;

use app\models\User;
use Yii;
use yii\filters\AccessControl;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\Controller;
use yii\web\ServerErrorHttpException;

class StatisticsController extends Controller
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

    public function actionMonth()
    {
        return 'test';
    }
}