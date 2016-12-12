<?php

namespace app\controllers;

use app\models\Analytics;
use app\models\User;
use yii\filters\AccessControl;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\Controller;
use Yii;

class AnalyticsController extends Controller
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

        return $behaviors;
    }

    public function actionExpense()
    {
        return Analytics::create($_GET['startDate'], $_GET['endDate'])->getExpenseByCategoryData();
    }

    public function actionIncome()
    {
        return Analytics::create($_GET['startDate'], $_GET['endDate'])->getIncomeByCategoryData();
    }
}