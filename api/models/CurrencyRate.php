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
     * @param int $currencyID
     * @param string $date date which need to check, format 'yyyy-MM-dd'
     * @return null|static
     */
    public static function findRate($currencyID, $date)
    {
        return self::findOne(['currency_id' => $currencyID, 'date' => $date]);
    }

    /**
     * Finds the latest exchange rate at the date of
     * @param Currency $currency
     * @param string $date |null limit date, format 'yyyy-MM-dd', if 'null' get rate on today
     * @return null|static
     */
    public static function getRate($currency, $date = null)
    {
        if (!$date) {
            $date = Carbon::today()->format('Y-m-d');
        }

        $rate = self::findRate($currency->id, $date);

        if (!$rate) {
            $rate = self::createDefaultRate($currency, $date);
        }

        return $rate;
    }

    /**
     * Create default rate
     * @param Currency $currency
     * @param string $date |null limit date, format 'yyyy-MM-dd', if 'null' get rate on today
     * @return null|static
     */
    protected static function createDefaultRate($currency, $date = null)
    {
        if ($date === null) {
            $date = Carbon::today()->format('Y-m-d');
        }

        $rate = new CurrencyRate();
        $rate->currency_id = $currency->id;
        $rate->date = $date;

        // for default currency set rate getting by nbu api
        if (!$currency->user_id) {
            $rateData = self::getRateDataNBU($currency->iso, Carbon::createFromFormat('Y-m-d', $date)->format('Ymd'));
            $rate->rate = $rateData['rate'];
            $rate->size = $rateData['size'];
        }


        if (!$rate->save()) {
            return null;
        }
        return $rate;
    }

    /**
     * Returns rate data from nbu api
     *
     * Example:
     * https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&date=20170226&json
     * [{"r030":978,"txt":"Євро","rate":28.448016,"cc":"EUR","exchangedate":"26.02.2017"}]
     *
     * @param $ISO
     * @param $date
     * @return array
     */
    protected function getRateDataNBU($ISO, $date)
    {
        $url = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=$ISO&date=$date&json";
        $rateData = null;

        if ($curl = curl_init()) {

            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

            $curlResult = curl_exec($curl);
            $rateData = json_decode($curlResult);

            curl_close($curl);
        }

        return [
            'rate' => is_array($rateData) && isset($rateData[0]) ? $rateData[0]->rate : 1,
            'size' => 1,
        ];
    }
}
