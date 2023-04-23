<?php

namespace app\models;

use DateInterval;
use DatePeriod;
use DateTime;
use Yii;
use Carbon\Carbon;
use yii\db\Expression;
use yii\db\Query;

/**
 * Class Analytics using for getting analytical data
 */
class Analytics
{
    /**
     * @var Carbon
     */
    public $startDate;

    /**
     * @var Carbon
     */
    public $endDate;

    private $_currencies = [];

    private $months = [
        '1' => 'янв',
        '2' => 'фев',
        '3' => 'мар',
        '4' => 'апр',
        '5' => 'май',
        '6' => 'июн',
        '7' => 'июл',
        '8' => 'авг',
        '9' => 'сен',
        '10' => 'окт',
        '11' => 'ноя',
        '12' => 'дек',
    ];

    /**
     * Factory method
     *
     * @param string|Carbon $startDate
     * @param string|Carbon $endDate
     * @return Analytics
     */
    public static function create($startDate, $endDate)
    {
        $analytics = new Analytics();

        $analytics->startDate = gettype($startDate) === 'string'
            ? Carbon::createFromFormat('Y-m-d', $startDate)
            : clone $startDate;

        $analytics->endDate = gettype($endDate) === 'string'
            ? Carbon::createFromFormat('Y-m-d', $endDate)
            : clone $endDate;

        $analytics->startDate->setTime(00, 00, 00);
        $analytics->endDate->setTime(23, 59, 59);

        return $analytics;
    }

    /**
     * Returns data about expenses ['name' => 'Food', 'amount' => 125]
     * Amount in main currency
     *
     * @return array
     */
    public function getExpenseByCategoryData()
    {
        return $this->getByCategoryData('expense');
    }

    /**
     * Returns data about expenses ['name' => 'Food', 'amount' => 125]
     * Amount in main currency
     *
     * @return array
     */
    public function getIncomeByCategoryData()
    {
        return $this->getByCategoryData('income');
    }

    /**
     * Returns data about expenses ['month' => 'apr 2017', 'amount' => 125]
     * Amount in main currency
     *
     * @return array
     */
    public function getExpenseByMonthData()
    {
        return $this->getByMonthData('expense');
    }

    /**
     * Returns data about expenses ['month' => 'apr 2017', 'amount' => 125]
     * Amount in main currency
     *
     * @return array
     */
    public function getIncomeByMonthData()
    {
        return $this->getByMonthData('income');
    }

    /**
     * Returns data about balance on the end of month ['month' => 'apr 2017', 'amount' => 125]
     * Amount in main currency
     *
     * @return array
     */
    public function getBalanceByMonthData()
    {
        $start    = (clone $this->startDate)->modify('first day of this month');
        $end      = (clone $this->endDate)->modify('first day of this month');
        $interval = DateInterval::createFromDateString('1 month');
        $period   = new DatePeriod($start, $interval, $end);

        $result = [];
        $now    = new DateTime();

        foreach ($period as $date) {

            $date->modify('last day of this month')->setTime(23, 59, 59);
            $balance = $this->getBalanceOnDate($date);
            $amount  = 0;

            $rateDate = min($date, $now);

            foreach ($balance as $row) {
                $currency = $this->getCurrency($row['currency_id']);
                $amount   += Currency::convertToMainCurrency(floatval($row['amount']), $currency, $rateDate->format('Y-m-d'));
            }

            $result[] = [
                'name' => $this->months[$date->format('n')] . ' ' . $date->format('Y'),
                'date' => $date->format('Y-m'),
                'amount' => $amount,
            ];
        }

        return $result;
    }

    /**
     * @return array
     */
    public function getCategoryWatchlist()
    {
        $userId = Yii::$app->user->getId();

        $query = new Query();
        $query->select([
            'transaction.date',
            'transaction.currency_id',
            'category.id as category_id',
            'category.name as category_name',
            'SUM(IF(transaction.income,transaction.amount,0)) as income',
            'SUM(IF(transaction.expense,transaction.amount,0)) as expense'
        ])
            ->from('transaction')
            ->innerJoin('category', 'transaction.category_id = category.id')
            ->where(['transaction.user_id' => $userId])
            ->andWhere(['category.watch' => true]);

        if ($this->startDate) {
            $query->andWhere(['>=', 'transaction.date', $this->startDate->format('Y-m-d H:i:s')]);
        }

        if ($this->endDate) {
            $query->andWhere(['<=', 'transaction.date', $this->endDate->format('Y-m-d H:i:s')]);
        }

        $query->groupBy(['date', 'currency_id', 'category_id', 'category_name']);
        $turnoverData = $query->all();
        $categories   = Category::findAll(['watch' => true]);

        $result = [];

        foreach ($categories as $category) {

            if (!isset($result[$category->id])) {
                $result[$category->id] = [
                    'name' => $category->name,
                    'income' => 0,
                    'expense' => 0,
                ];
            }

            foreach ($turnoverData as $row) {

                if ($category->id != $row['category_id']) {
                    continue;
                }

                $currency = $this->getCurrency($row['currency_id']);
                $date     = $row['date'];

                $result[$category->id]['income']  += Currency::convertToMainCurrency($row['income'], $currency, $date);
                $result[$category->id]['expense'] += Currency::convertToMainCurrency($row['expense'], $currency, $date);
            }
        }

        return array_values($result);
    }

    /**
     * Returns data about expenses or income by category ['name' => 'Food', 'amount' => 125]
     *
     * @param string $type
     * @return array
     */
    private function getByCategoryData($type)
    {
        $userId = Yii::$app->user->getId();

        $query = new Query();
        $query->select([
            'transaction.date',
            'transaction.currency_id',
            'category.id as category_id',
            'category.name as category_name',
            'SUM(transaction.amount) as amount'])
            ->from('transaction')
            ->leftJoin('category', 'transaction.category_id = category.id')
            ->where(['transaction.user_id' => $userId])
            ->andWhere(['transaction.' . $type => true]);

        if ($this->startDate) {
            $query->andWhere(['>=', 'transaction.date', $this->startDate->format('Y-m-d H:i:s')]);
        }

        if ($this->endDate) {
            $query->andWhere(['<=', 'transaction.date', $this->endDate->format('Y-m-d H:i:s')]);
        }

        $query->groupBy(['date', 'currency_id', 'category_id', 'category_name']);

        return $this->prepareByCategoryData($query->all());
    }

    /**
     * Returns data about expenses or income by month ['month' => 'apr 2017', 'amount' => 125]
     *
     * @param string $type
     * @return array
     */
    private function getByMonthData($type)
    {
        $userId = Yii::$app->user->getId();

        $query = new Query();
        $query->select([
            'transaction.date',
            'transaction.currency_id',
            'SUM(transaction.amount) as amount'])
            ->from('transaction')
            ->where(['transaction.user_id' => $userId])
            ->andWhere(['transaction.' . $type => true]);

        if ($this->startDate) {
            $query->andWhere(['>=', 'transaction.date', $this->startDate->format('Y-m-d')]);
        }

        if ($this->endDate) {
            $query->andWhere(['<=', 'transaction.date', $this->endDate->format('Y-m-d')]);
        }

        if (isset($_GET['category']) && $categoryId = $_GET['category']) {
            $query->andWhere(['transaction.category_id' => $categoryId]);
        }

        $query->groupBy(['date', 'currency_id']);

        return $this->prepareByMonthData($query->all());
    }

    /**
     * Convert query result about expenses or income to array ['name' => 'Food', 'amount' => 125]
     *
     * @param array $data
     * @return array
     */
    private function prepareByCategoryData($data)
    {
        $result = [];

        foreach ($data as $row) {

            $categoryId   = $row['category_id'];
            $categoryName = $row['category_name'];

            $currency = $this->getCurrency($row['currency_id']);
            $date     = $row['date'];

            $amount               = floatval($row['amount']);
            $amountInMainCurrency = Currency::convertToMainCurrency($amount, $currency, $date);

            if (!isset($result[$categoryId])) {
                $result[$categoryId] = [
                    'name' => $categoryName == null ? 'Корректировка' : $categoryName,
                    'amount' => $amountInMainCurrency,
                ];
            } else {
                $result[$categoryId]['amount'] += $amountInMainCurrency;
            }
        }

        // sort result by amount descending
        $result = array_values($result);
        usort($result, function ($a, $b) {

            if ($a['amount'] == $b['amount']) {
                return 0;
            }

            return ($a['amount'] < $b['amount']) ? 1 : -1;
        });

        return $result;
    }

    /**
     * Convert query result about expenses or income to array ['month' => 'apr 2017', 'amount' => 125]
     *
     * @param array $data
     * @return array
     */
    private function prepareByMonthData($data)
    {
        $result = [];

        $period = new DatePeriod($this->startDate, DateInterval::createFromDateString('1 month'), $this->endDate);
        foreach ($period as $date) {
            $month          = $date->format('Y-m');
            $result[$month] = [
                'name' => $this->months[$date->format('n')] . ' ' . $date->format('Y'),
                'date' => $month,
                'amount' => 0,
            ];
        }

        foreach ($data as $row) {

            $currency = $this->getCurrency($row['currency_id']);

            $date    = $row['date'];
            $dateObj = Carbon::createFromFormat('Y-m-d', $date);
            $month   = $dateObj->format('Y-m');

            $amount               = floatval($row['amount']);
            $amountInMainCurrency = Currency::convertToMainCurrency($amount, $currency, $date);

            if (!isset($result[$month])) {
                $result[$month] = [
                    'name' => $this->months[$dateObj->format('n')] . ' ' . $dateObj->format('Y'),
                    'date' => $month,
                    'amount' => $amountInMainCurrency,
                ];
            } else {
                $result[$month]['amount'] += $amountInMainCurrency;
            }
        }

        // sort result by date descending
        $result = array_values($result);
        usort($result, function ($a, $b) {

            if ($a['date'] == $b['date']) {
                return 0;
            }

            return ($a['date'] > $b['date']) ? 1 : -1;
        });

        return $result;
    }

    protected function getBalanceOnDate($date)
    {
        $userId = Yii::$app->user->getId();

        $subQuery = new Query();
        $subQuery->select([
            new Expression('CASE
              WHEN expense
                   OR transfer THEN -amount
              WHEN income THEN amount
              ELSE 0
             END AS amount'),
            'account_id',
            'currency_id',
        ])->from('transaction')
            ->where(['user_id' => $userId])
            ->andWhere(['is not', 'account_id', null])
            ->andWhere(['<=', 'date', $date]);

        $subQuery2 = new Query();
        $subQuery2->select([
            'recipient_amount',
            'recipient_account_id',
            'recipient_currency_id',
        ])->from('transaction')
            ->where(['user_id' => $userId])
            ->andWhere(['is not', 'recipient_account_id', null])
            ->andWhere(['<=', 'date', $date]);

        $subQuery->union($subQuery2, true);

        $queryMain = new Query();
        $queryMain->select([
            'SUM(balance.amount) AS amount',
            'balance.currency_id AS currency_id',
        ])->from(['balance' => $subQuery])
            ->leftJoin(
                'account_currency AS ac',
                'balance.account_id = ac.account_id AND balance.currency_id = ac.currency_id'
            )->where(['ac.is_balance' => true])
            ->orWhere(['ac.is_balance' => null])
            ->groupBy(['balance.currency_id']);

        return $queryMain->all();
    }

    /**
     * Returns currency by ID
     *
     * @param string $id currency ID
     * @return Currency|null
     */
    private function getCurrency($id)
    {
        if (isset($this->_currencies[$id])) {
            $currency = $this->_currencies[$id];
        } else {
            $currency               = Currency::findCurrency($id);
            $this->_currencies[$id] = $currency;
        }

        return $currency;
    }

    /**
     * Returns total expense in period
     *
     * @return number
     */
    public function getTotalExpense()
    {
        return array_sum(array_column($this->getExpenseByCategoryData(), 'amount'));
    }

    /**
     * Returns total income in period
     *
     * @return number
     */
    public function getTotalIncome()
    {
        return array_sum(array_column($this->getIncomeByCategoryData(), 'amount'));
    }
}