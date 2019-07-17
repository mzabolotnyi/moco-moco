<?php

namespace app\controllers;

use app\models\User;
use app\services\ImportService;
use yii\filters\AccessControl;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\Controller;

class ImportController extends Controller
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

    public function actionGetTransactionsForImport()
    {
        $request = \Yii::$app->request;
        $defaultDateValue = (new \DateTime())->format('Y-m-d');
        $startDateQuery = $request->get('startDate', $defaultDateValue);
        $endDateQuery = $request->get('endDate', $defaultDateValue);
        $startDate = \DateTime::createFromFormat('Y-m-d', $startDateQuery);
        $entDate = \DateTime::createFromFormat('Y-m-d', $endDateQuery);

        return ImportService::create()->getTransactionsForImport($startDate, $entDate);
    }
}