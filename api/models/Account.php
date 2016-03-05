<?php

namespace app\models;

use yii\helpers\Url;

/**
 * This is the model class for table "account".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $name
 * @property string $color
 * @property integer $active
 * @property string $created_at
 * @property string $updated_at
 */
class Account extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'account';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['name', 'color', 'active', '!user_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'name'], 'required'],
            ['name', 'string', 'max' => 255],
            ['color', 'string', 'max' => 7],
            ['color', 'default', 'value' => '#009688'],
            ['active', 'boolean'],
            ['active', 'default', 'value' => 1],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'currency' => 'Валюта',
            'color' => 'Цвет',
            'active' => 'Активный',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/accounts/$this->id", true);
            },
            'id',
            'name',
            'color',
            'active',
            'user_id',
        ];
    }

    /**
     * Binds currency with account by creating and saving AccountCurrency model
     * @param \app\models\Currency $currency
     * @return bool
     */
    public function bindCurrency($currency)
    {
        $params = ['account_id' => $this->id, 'currency_id' => $currency->id];
        $model = AccountCurrency::findOne($params);

        if (!$model) {
            $model = new AccountCurrency($params);
            return $model->save();
        }

        return true;
    }

    /**
     * Unbinds currency from account by deleting AccountCurrency model
     * @param \app\models\Currency $currency
     * @return bool
     */
    public function unbindCurrency($currency)
    {
        $params = ['account_id' => $this->id, 'currency_id' => $currency->id];
        $model = AccountCurrency::findOne($params);

        if ($model) {
            return $model->delete();
        }

        return true;
    }
}
