<?php

namespace app\models;

/**
 * This is the model class for table "account_currency".
 *
 * @property integer $account_id
 * @property integer $currency_id
 * @property integer $is_balance
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property Currency $currency
 * @property Account $account
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
        $scenarios[self::SCENARIO_DEFAULT] = ['is_balance', '!account_id', '!currency_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['account_id', 'currency_id'], 'required'],
            ['is_balance', 'boolean'],
            ['account_id', 'exist', 'targetClass' => Account::className(), 'targetAttribute' => ['account_id' => 'id']],
            ['currency_id', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currency_id' => 'id']],
            ['is_balance', 'default', 'value' => 1]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'account_id' => 'ID счета',
            'currency_id' => 'ID валюты',
            'is_balance' => 'Учитывать в балансе',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'is_balance',
            'account_id',
            'currency' => function () {
                return $this->currency;
            },
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCurrency()
    {
        return $this->currency_id === null ? null : $this->hasOne(Currency::className(), ['id' => 'currency_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAccount()
    {
        return $this->account_id === null ?
            null : $this->hasOne(Account::className(), ['id' => 'account_id']);
    }
}
