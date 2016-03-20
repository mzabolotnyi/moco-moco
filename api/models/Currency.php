<?php

namespace app\models;

use Yii;
use yii\base\Object;
use yii\helpers\Url;
use yii\web\NotFoundHttpException;

/**
 * This is the model class for table "currency".
 *
 * @property integer $id
 * @property string $iso
 * @property string $name
 * @property string $symbol
 * @property string $user_id
 * @property string $created_at
 * @property string $updated_at
 *
 * @property User $user
 */
class Currency extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'currency';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['iso', 'name', 'symbol', '!user_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['iso', 'name', 'symbol', 'user_id'], 'required'],
            [['iso'], 'string', 'max' => 3],
            [['name'], 'string', 'max' => 255],
            [['symbol'], 'string', 'max' => 1],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'iso' => 'ISO',
            'name' => 'Название',
            'symbol' => 'Символьное обозначение',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/currencies/$this->id", true);
            },
            'id',
            'iso',
            'name',
            'symbol',
            'userId' => 'user_id',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->user_id === null ?
            null : $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    /**
     * Finds the latest exchange rate at the date of
     * @param string $date |null limit date, format 'yyyy-MM-dd', if 'null' get rate on today
     * @return null|CurrencyRate
     */
    public function getRate($date = null)
    {
        return CurrencyRate::getRate($this->id, $date);
    }

    /**
     * Returns the default currency based on the default ISO in params
     * @return \app\models\Currency
     */
    public static function findDefaultCurrency()
    {
        return self::findOne(['iso' => \Yii::$app->params['defaultCurrency'], 'user_id' => null]);
    }

    /**
     * Returns the currency based on the primary key given.
     * If the currency is not found or deny access, a 404 HTTP exception will be raised.
     * @param string $id the ID of the currency to be loaded.
     * @return \app\models\Currency the currency found
     * @throws NotFoundHttpException if the currency cannot be found
     */
    public static function findCurrency($id)
    {
        $model = self::findOne($id);

        if ($model === null) {
            throw new NotFoundHttpException('Ресурс не найден');
        }

        if (\Yii::$app->user->can(User::ROLE_ADMIN)) {
            return $model;
        }

        $modelOwnerId = $model->user_id;
        $availableOwnersId = [\Yii::$app->user->getId(), 0, null];

        if (!in_array($modelOwnerId, $availableOwnersId)) {
            throw new NotFoundHttpException('Ресурс не найден');
        }

        return $model;
    }

    /**
     * Converts amount to main currency
     * @param double $amount amount in currency
     * @param static|string $currency current currency or currency ID
     * @param string|null $date limit date, format 'yyyy-MM-dd', if 'null' get rate on today
     * @return double
     */
    public static function convertToMainCurrency($amount, $currency, $date = null)
    {
        if ($amount === 0) {
            return 0;
        }

        if (!$currency instanceof Currency) {
            $currency = self::findOne($currency);
        }

        $mainCurrency = self::getMainCurrency();

        if ($currency === $mainCurrency) {
            return $amount;
        }

        $currencyRate = $currency->getRate($date);
        $mainCurrencyRate = $mainCurrency->getRate($date);

        if ($currencyRate === null) {
            $currencyRate = new CurrencyRate(['rate' => 1, 'size' => 1]);
        }

        if ($mainCurrencyRate === null) {
            $mainCurrencyRate = new CurrencyRate(['rate' => 1, 'size' => 1]);
        }

        if ($currencyRate->rate === 0 || $mainCurrencyRate->rate === 0
            || $currencyRate->size === 0 || $mainCurrencyRate->size === 0
        ) {
            return 0;
        }

        return round(($amount * $currencyRate->rate * $mainCurrencyRate->size)
            / ($mainCurrencyRate->rate * $currencyRate->size)
            , 2);
    }

    /**
     * Returns main currency of current user
     * @return static|null
     */
    protected static function getMainCurrency()
    {
        // TODO можно реализовать через кэш
        return Yii::$app->user->getIdentity()->getProfile()->currency;
    }


}
