<?php

namespace app\models;

use yii\helpers\Url;

/**
 * This is the model class for table "currency_rate".
 *
 * @property integer $currency_id
 * @property string $date
 * @property double $rate
 * @property integer $size
 * @property integer $created_at
 * @property integer $updated_at
 */
class CurrencyRate extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'currency_rate';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['!currency_id', '!date', 'rate', 'size'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['currency_id', 'date'], 'required'],
            ['date', 'date', 'format' => 'yyyy-MM-dd'],
            ['date', 'validateUnique'],
            ['currency_id', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currency_id' => 'id']],
            ['rate', 'number'],
            ['size', 'integer'],
            [['rate', 'size'], 'default', 'value' => 1],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'currency_id' => 'ID валюты',
            'date' => 'Дата',
            'rate' => 'Курс',
            'size' => 'Кратность',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/currencies/$this->currency_id/rates/$this->date", true);
            },
            'currency_id',
            'date',
            'rate',
            'size',
            'currency' => function () {
                return ['href' => Url::to("/currencies/$this->currency_id", true)];
            },
        ];
    }

    /**
     * Check unique of currency rate
     * @param string $attribute
     * @param  array $params
     */
    public function validateUnique($attribute, $params)
    {
        if ($this->isNewRecord && !$this->hasErrors()) {
            if (self::findRate($this->currency_id, $this->date) !== null) {
                $this->addError($attribute, "Курс на $this->date уже установлен");
            }
        }
    }

    /**
     * @param integer $currencyId ID of currency
     * @param string $date date which need to check, format 'yyyy-MM-dd'
     * @return null|static
     */
    public static function findRate($currencyId, $date)
    {
        return self::findOne(['currency_id' => $currencyId, 'date' => $date]);
    }
}
