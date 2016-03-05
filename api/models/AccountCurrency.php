<?php

namespace app\models;

use yii\helpers\Url;

/**
 * This is the model class for table "account_currency".
 *
 * @property integer $account_id
 * @property integer $currency_id
 * @property integer $created_at
 * @property integer $updated_at
 */
class AccountCurrency extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'account_currency';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['!account_id', '!currency_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['account_id', 'currency_id'], 'required'],
            ['account_id', 'exist', 'targetClass' => Account::className(), 'targetAttribute' => ['account_id' => 'id']],
            ['currency_id', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currency_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'currency_id' => 'ID счета',
            'currency_id' => 'ID валюты',
        ];
    }
}
