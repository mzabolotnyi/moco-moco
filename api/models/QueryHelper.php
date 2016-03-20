<?php

namespace app\models;

/**
 * Class QueryHelper using for filtering and sorting \yii\db\Query
 * @package app\models
 */
class QueryHelper
{
    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////FILTERING////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Apply filters to query
     *
     * @param array $attributes available attributes for filtering
     * @param \yii\db\Query $query
     * @param array $params of filtering, associated array of 'key' => 'value' pairs
     * Example:
     *         name = Kate:                 'name' => 'Kate'
     *         name != Kate:                'name' => '!Kate'
     *         name = Jane or Kate:         'name' => 'Jane;Kate'
     *         comment like 'test':         'comment' => '^test'
     *         amount > 1000:               'amount' => '>1000'
     *         amount >= 1000:              'amount' => '>=1000'
     *         amount < 1000:               'amount' => '<1000'
     *         amount <= 1000:              'amount' => '<=1000'
     *         amount >= 100 and <= 1000:   'amount' => '100:1000'
     *
     * @return \yii\db\Query
     */
    public static function filter($attributes, $query, $params)
    {
        foreach ($params as $key => $param) {

            if (!in_array($key, $attributes)) {
                continue;
            }

            // filter by range
            $values = explode(':', $param);

            if (count($values)>1){
                $query->andFilterWhere(['>=', $key, $values[0]]); // start of range
                $query->andFilterWhere(['<=', $key, $values[1]]); // end of range
                continue;
            }

            // filter by other conditions
            $values = explode(';', $param);

            foreach ($values as $index => $value) {
                if ($index == 0) {
                    self::addAndFilter($query, $key, $value);
                } else {
                    self::addOrFilter($query, $key, $value);
                }
            }
        }

        return $query;
    }

    /**
     * Add 'and' filter to query
     * @param \yii\db\Query $query
     * @param string $key parameter name
     * @param string $value parameter value
     * @return \yii\db\Query
     */
    protected static function addAndFilter($query, $key, $value)
    {
        if (substr($value, 0, 1) == '!') {
            $query->andFilterWhere(['!=', $key, substr($value, 1)]);
        } elseif (substr($value, 0, 1) == '^') {
            $query->andFilterWhere(['like', $key, substr($value, 1)]);
        } elseif (substr($value, 0, 2) == '>=') {
            $query->andFilterWhere(['>=', $key, substr($value, 2)]);
        } elseif (substr($value, 0, 2) == '<=') {
            $query->andFilterWhere(['<=', $key, substr($value, 2)]);
        } elseif (substr($value, 0, 1) == '>') {
            $query->andFilterWhere(['>', $key, substr($value, 1)]);
        } elseif (substr($value, 0, 1) == '<') {
            $query->andFilterWhere(['<', $key, substr($value, 1)]);
        } elseif ($value == 'null') {
            $query->andWhere([$key => null]);
        } else {
            $query->andWhere([$key => $value]);
        }

        return $query;
    }

    /**
     * Add 'or' filter to query
     * @param \yii\db\Query $query
     * @param string $key parameter name
     * @param string $value parameter value
     * @return \yii\db\Query
     */
    protected static function addOrFilter($query, $key, $value)
    {
        if (substr($value, 0, 1) == '!') {
            $query->orFilterWhere(['!=', $key, substr($value, 1)]);
        } elseif (substr($value, 0, 1) == '^') {
            $query->orFilterWhere(['like', $key, substr($value, 1)]);
        } elseif (substr($value, 0, 2) == '>=') {
            $query->orFilterWhere(['>=', $key, substr($value, 2)]);
        } elseif (substr($value, 0, 2) == '<=') {
            $query->orFilterWhere(['<=', $key, substr($value, 2)]);
        } elseif (substr($value, 0, 1) == '>') {
            $query->orFilterWhere(['>', $key, substr($value, 1)]);
        } elseif (substr($value, 0, 1) == '<') {
            $query->orFilterWhere(['<', $key, substr($value, 1)]);
        } elseif ($value == 'null') {
            $query->orWhere([$key => null]);
        } else {
            $query->orWhere([$key => $value]);
        }

        return $query;
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////SORTING/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Apply sorting to query
     *
     * @param \yii\db\Query $query
     * @param string $columns the columns (and the directions) to be ordered by, e.g. 'id ASC, name DESC'
     * @return \yii\db\Query
     */
    public static function sort($query, $columns)
    {
        $query->orderBy($columns);

        return $query;
    }
}