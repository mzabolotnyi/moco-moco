<?php

namespace app\controllers;

use app\models\Analytics;
use app\models\User;
use Carbon\Carbon;
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

    public function actionWidgetData($period)
    {
        $startMonth = Carbon::createFromFormat('Y-m-d', $period)->startOfMonth();
        $endMonth = Carbon::createFromFormat('Y-m-d', $period)->endOfMonth();

        $analytics = Analytics::create($startMonth, $endMonth);
        $totalExpense = $analytics->getTotalExpense();
        $totalIncome = $analytics->getTotalIncome();
        $profit = $totalIncome - $totalExpense;

        $analyticsPrev = Analytics::create($startMonth->addMonth(-1), $endMonth->addMonth(-1));
        $totalExpensePrev = $analyticsPrev->getTotalExpense();
        $totalIncomePrev = $analyticsPrev->getTotalIncome();
        $profitPrev = $totalIncomePrev - $totalExpensePrev;

        $dynamicsExpense = $totalExpensePrev === 0 ? 0 : round($totalExpense / $totalExpensePrev - 1, 2) * 100;
        $dynamicsIncome = $totalIncomePrev === 0 ? 0 : round($totalIncome / $totalIncomePrev - 1, 2) * 100;
        $dynamicsProfit = round($profit - $profitPrev, 2);

        return [
            'expense' => [
                'amount' => $totalExpense,
                'amountPrev' => $totalExpensePrev,
                'dynamics' => $dynamicsExpense,
            ],
            'income' => [
                'amount' => $totalIncome,
                'amountPrev' => $totalIncomePrev,
                'dynamics' => $dynamicsIncome,
            ],
            'profit' => [
                'amount' => $profit,
                'amountPrev' => $profitPrev,
                'dynamics' => $dynamicsProfit,
            ]
        ];
    }
}