<?php

namespace app\controllers;

use app\models\Analytics;
use app\models\User;
use Carbon\Carbon;
use Yii;
use yii\db\Query;
use yii\filters\AccessControl;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\Controller;

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

    public function actionTurnoverByMonth()
    {
        $analytics = Analytics::create($_GET['startDate'], $_GET['endDate']);

        return [
            'income' => $analytics->getIncomeByMonthData(),
            'expense' => $analytics->getExpenseByMonthData(),
        ];
    }

    public function actionWidgetData($period)
    {
        $startMonth = Carbon::createFromFormat('Y-m-d', $period)->startOfMonth();
        $endMonth = Carbon::createFromFormat('Y-m-d', $period)->endOfMonth();

        $analytics = Analytics::create($startMonth, $endMonth);
        $totalExpense = $analytics->getTotalExpense();
        $totalIncome = $analytics->getTotalIncome();
        $profit = $totalIncome - $totalExpense;

        return [
            'expense' => [
                'amount' => $totalExpense
            ],
            'income' => [
                'amount' => $totalIncome
            ],
            'profit' => [
                'amount' => $profit
            ]
        ];
    }

    public function actionMostPopularTransactions()
    {
        $userId = Yii::$app->user->getId();

        $query = new Query();
        $query->select([
            'transaction.category_id as categoryId',
            'category.name as categoryName',
            'category.icon as categoryIcon',
            'transaction.account_id as accountId',
            'account.name as accountName',
            'account.color as accountColor',
            'transaction.currency_id as currencyId',
            'currency.symbol as currencySymbol',
            'transaction.expense',
            'transaction.income',
            'COUNT(transaction.id) as count'])
            ->from('transaction')
            ->leftJoin('category', 'transaction.category_id = category.id')
            ->leftJoin('account', 'transaction.account_id = account.id')
            ->leftJoin('currency', 'transaction.currency_id = currency.id')
            ->where(['transaction.user_id' => $userId])
            ->andWhere('transaction.category_id IS NOT NULL')
            ->andWhere('transaction.transfer = 0')
            ->andWhere('transaction.date BETWEEN NOW() - INTERVAL 100 DAY AND NOW()')
            ->groupBy(['category_id', 'account_id', 'currency_id'])
            ->orderBy('count DESC')
            ->limit(12);

        $result = $query->all();

        foreach ($result as &$item) {
            $item['categoryId'] = (int)$item['categoryId'];
            $item['accountId'] = (int)$item['accountId'];
            $item['currencyId'] = (int)$item['currencyId'];
            $item['expense'] = (int)$item['expense'];
            $item['income'] = (int)$item['income'];
            $item['count'] = (int)$item['count'];
        }

        return $result;
    }

    public function actionCategoryWatchlist()
    {
        return Analytics::create($_GET['startDate'], $_GET['endDate'])->getCategoryWatchlist();
    }
}