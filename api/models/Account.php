<?php

namespace app\models;

use yii\helpers\Url;
use app\models\Balance;

/**
 * This is the model class for table "account".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $name
 * @property string $color
 * @property string $merchant_id
 * @property string $merchant_password
 * @property string $card_number
 * @property string $import_type
 * @property integer $import
 * @property integer $active
 * @property string $created_at
 * @property string $updated_at
 *
 * @property User $user
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
        $scenarios[self::SCENARIO_DEFAULT] = ['name', 'color', 'active', 'merchant_id', 'merchant_password', 'card_number', 'import_type', 'import', '!user_id'];

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
            ['active', 'boolean'],
            ['import', 'boolean'],
            ['color', 'default', 'value' => '#009688'],
            ['active', 'default', 'value' => 1],
            ['active', 'default', 'value' => 1],
            ['import', 'default', 'value' => 0],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'color' => 'Цвет',
            'active' => 'Активный',
            'merchant_id' => 'ID мерчанта',
            'merchant_password' => 'Пароль мерчанта',
            'card_number' => 'Номер счета',
            'import_type' => 'Формат импорта',
            'import' => 'Импортировать операции',
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
            'userId' => 'user_id',
            'merchantId' => 'merchant_id',
            'merchantPassword' => 'merchant_password',
            'cardNumber' => 'card_number',
            'importType' => 'import_type',
            'import' => function () {
                return $this->isImport();
            },
            'countTrans' => function () {
                return (int)$this->hasMany(Transaction::className(), ['account_id' => 'id'])->count()
                + (int)$this->hasMany(Transaction::className(), ['recipient_account_id' => 'id'])->count();
            },
            'currencies' => function () {
                return $this->getCurrencies();
            }
        ];
    }

    /**
     * @return string
     */
    public function getMerchantId()
    {
        return $this->merchant_id;
    }

    /**
     * @return string
     */
    public function getMerchantPassword()
    {
        return $this->merchant_password;
    }

    /**
     * @return string
     */
    public function getCardNumber()
    {
        return $this->card_number;
    }

    /**
     * @return string
     */
    public function getImportType()
    {
        return $this->import_type;
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
     * Returns a value indicating whether the account is active
     * @return bool
     */
    public function isActive()
    {
        return (int)$this->active;
    }

    /**
     * @return bool
     */
    public function isImport()
    {
        return (int)$this->import;
    }


    /**
     * Binds currency with account by creating and saving AccountCurrency model
     * @param \app\models\Currency $currency
     * @return bool
     */
    public function bindCurrency($currency, $params = [])
    {
        $pk = ['account_id' => $this->id, 'currency_id' => $currency->id];
        $model = AccountCurrency::findOne($pk);

        if (!$model) {
            $params = array_merge($pk, $params);
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

    public function getCurrencies()
    {
        return AccountCurrency::findAll(['account_id' => $this->id]);
    }

    public function getCurrency($ISO)
    {
        foreach ($this->getCurrencies() as $accountCurrency) {
            /** @var Currency $currency */
            $currency = $accountCurrency->currency;
            if ($currency && $currency->getIso() === $ISO) {
                return $currency;
            }
        }

        return null;
    }
}
