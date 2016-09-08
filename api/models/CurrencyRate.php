<?php

namespace app\models;

use Carbon\Carbon;
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
 *
 * @property Currency $currency
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
            ['rate', 'number', 'min' => 0.0001],
            ['size', 'integer', 'min' => 1],
            ['currency_id', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currency_id' => 'id']],
            ['date', 'validateUnique'],
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
            'date',
            'rate' => function () {
                return $this->size = 0 ? 1 : $this->rate / $this->size;
            },
            'currencyId' => 'currency_id',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCurrency()
    {
        return $this->currency_id === null ?
            null : $this->hasOne(Currency::className(), ['id' => 'currency_id']);
    }

    /**
     * Check unique of currency rate
     * @param string $attribute
     * @param array $params
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
     * Finds rate for currency on date
     * @param integer $id ID of currency
     * @param string $date date which need to check, format 'yyyy-MM-dd'
     * @return null|static
     */
    public static function findRate($id, $date)
    {
        return self::findOne(['currency_id' => $id, 'date' => $date]);
    }

    /**
     * Finds the latest exchange rate at the date of
     * @param integer $id ID of currency
     * @param string $date |null limit date, format 'yyyy-MM-dd', if 'null' get rate on today
     * @return null|static
     */
    public static function getRate($id, $date = null)
    {
        if ($date === null) {
            $date = Carbon::today()->format('Y-m-d');
        }

        return self::find()->where(['currency_id' => $id])
            ->andWhere(['<=', 'date', $date])
            ->orderBy('date DESC')
            ->one();
    }

    /**
     * Create default rate
     * @param integer $id ID of currency
     * @param string $date |null limit date, format 'yyyy-MM-dd', if 'null' get rate on today
     * @return null|static
     */
    public static function createDefaultRate($id, $date = null)
    {
        if ($date === null) {
            $date = Carbon::today()->format('Y-m-d');
        }

        $rate = new CurrencyRate();
        $rate->currency_id = $id;
        $rate->date = $date;

        if (!$rate->save()){
            return null;
        }
        return $rate;
    }
}
