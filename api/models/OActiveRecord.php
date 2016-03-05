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

        QueryHelper::filter(self::attributes(), $query, $params);

        if (!empty($params['sort'])) {
            QueryHelper::sort($query, $params['sort']);
        }

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $tableName = self::tableName();
        $dependency = new DbDependency();
        $dependency->sql = "SELECT max(updated_at), count(updated_at) FROM $tableName";

        self::getDb()->cache(function ($db) use ($dataProvider) {
            $dataProvider->prepare();
        }, null, $dependency);

        return $dataProvider;
    }
}

