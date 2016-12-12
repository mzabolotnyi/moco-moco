<?php

namespace app\models;

use Yii;
use Carbon\Carbon;
use yii\base\Model;
use yii\db\Expression;
use yii\db\Query;

/**
 * Class Analytics using for getting analytical data
 */
class Analytics extends Model
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

    /**
     * Factory method
     *
     * @param string $startDate
     * @param string $endDate
     * @return Analytics
     */
    public static function create($startDate, $endDate)
    {
        $analytics = new Analytics();
        $analytics->startDate = gettype($startDate) === 'string' ? new Carbon($startDate) : $startDate;
        $analytics->endDate = gettype($endDate) === 'string' ? new Carbon($endDate) : $endDate;

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
     * Returns data about expenses or income ['name' => 'Food', 'amount' => 125]
     *
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
     * Convert query result about expenses or income to array ['name' => 'Food', 'amount' => 125]
     *
     * @return array
     */
    private function prepareByCategoryData($queryResult)
    {
        $result = [];

        foreach ($queryResult as $row) {

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
     * Returns currency by ID
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
}