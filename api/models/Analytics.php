<?php

namespace app\models;

use Yii;
use Carbon\Carbon;
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
            $query->andWhere(['>=', 'transaction.date', $this->startDate->format('Y-m-d')]);
        }

        if ($this->endDate) {
            $query->andWhere(['<=', 'transaction.date', $this->endDate->format('Y-m-d')]);
        }

        $query->groupBy(['date', 'currency_id', 'category_id', 'category_name']);
        $turnoverData = $query->all();
        $categories = Category::findAll(['watch' => true]);

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
                $date = $row['date'];

                $result[$category->id]['income'] += Currency::convertToMainCurrency($row['income'], $currency, $date);
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
            $query->andWhere(['>=', 'transaction.date', $this->startDate->format('Y-m-d')]);
        }

        if ($this->endDate) {
            $query->andWhere(['<=', 'transaction.date', $this->endDate->format('Y-m-d')]);
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

        if ($categoryId = $_GET['category']) {
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

            $categoryId = $row['category_id'];
            $categoryName = $row['category_name'];

            $currency = $this->getCurrency($row['currency_id']);
            $date = $row['date'];

            $amount = floatval($row['amount']);
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

        foreach ($data as $row) {

            $currency = $this->getCurrency($row['currency_id']);

            $date = $row['date'];
            $dateObj = Carbon::createFromFormat('Y-m-d', $date);
            $month = $dateObj->format('Y-m');

            $amount = floatval($row['amount']);
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
            $currency = Currency::findCurrency($id);
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