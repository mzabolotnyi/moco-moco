<?php

namespace app\models;

use yii\behaviors\TimestampBehavior;
use yii\caching\DbDependency;
use yii\data\ActiveDataProvider;
use yii\db\ActiveRecord;

/**
 * OActiveRecord overrides default ActiveRecord class and extends his functionality.
 *
 */
class OActiveRecord extends ActiveRecord implements ISearchable
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    /**
     * @inheritdoc
     */
    public static function search($params = [])
    {
        $query = self::find();

        $availableAttributes = self::getTableSchema()->getColumnNames();
        QueryHelper::filter($availableAttributes, $query, $params);

        if (!empty($params['sort'])) {
            QueryHelper::sort($query, $params['sort']);
        }

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        return $dataProvider;
    }
}

