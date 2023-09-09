<?php

namespace app\models;

use Carbon\Carbon;
use Yii;
use yii\helpers\Url;
use yii\web\BadRequestHttpException;

/**
 * This is the model class for table "transaction".
 *
 * @property integer $id
 * @property integer $user_id
 * @property integer $currency_id
 * @property string $currency_original
 * @property integer $recipient_currency_id
 * @property integer $account_id
 * @property integer $recipient_account_id
 * @property integer $category_id
 * @property double $amount
 * @property double $amount_original
 * @property double $recipient_amount
 * @property string $date
 * @property string $comment
 * @property integer $expense
 * @property integer $income
 * @property integer $transfer
 * @property string $created_at
 * @property string $updated_at
 * @property string $external_id
 *
 * @property Currency $currency
 * @property Account $account
 * @property Currency $recipientCurrency
 * @property Account $recipientAccount
 * @property Category $category
 * @property User $user
 */
class Transaction extends OActiveRecord
{
    const SCENARIO_EXPANSE = 'expense';
    const SCENARIO_INCOME = 'income';
    const SCENARIO_TRANSFER = 'transfer';

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'transaction';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();

        $attributes = [
            'currency_id', 'currency_original', 'account_id', 'category_id', 'amount', 'amount_original', 'date', 'comment', 'external_id',
            '!user_id', '!expense', '!income', '!transfer'
        ];

        $attributesTransfer = [
            'currency_id', 'recipient_currency_id', 'recipient_account_id', 'account_id',
            'category_id', 'amount', 'recipient_amount', 'date', 'comment', 'external_id',
            '!user_id', '!expense', '!income', '!transfer'
        ];

        $scenarios[self::SCENARIO_EXPANSE] = $attributes;
        $scenarios[self::SCENARIO_INCOME] = $attributes;
        $scenarios[self::SCENARIO_TRANSFER] = $attributesTransfer;

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'currency_id', 'account_id'], 'required'],
            [['recipient_currency_id', 'recipient_account_id'], 'required', 'on' => self::SCENARIO_TRANSFER],
            [['user_id', 'currency_id', 'recipient_currency_id', 'account_id', 'recipient_account_id', 'category_id'], 'integer'],
            [['amount', 'recipient_amount'], 'number', 'numberPattern' => '/^[-+]?[0-9]*\.?[0-9]{1,2}$/'],
            ['date', 'date', 'format' => 'yyyy-MM-dd'],
            ['comment', 'string', 'max' => 255],
            ['currency_id', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currency_id' => 'id']],
            ['account_id', 'exist', 'targetClass' => Account::className(), 'targetAttribute' => ['account_id' => 'id']],
            ['category_id', 'exist', 'targetClass' => Category::className(), 'targetAttribute' => ['category_id' => 'id']],
            ['recipient_currency_id', 'exist', 'targetClass' => Currency::className(),
                'targetAttribute' => ['recipient_currency_id' => 'id'], 'on' => self::SCENARIO_TRANSFER],
            ['recipient_account_id', 'exist', 'targetClass' => Account::className(),
                'targetAttribute' => ['recipient_account_id' => 'id'], 'on' => self::SCENARIO_TRANSFER],
            ['account_id', 'validateRelations'],
            [['amount', 'recipient_amount'], 'default', 'value' => 0],
            ['date', 'default', 'value' => Carbon::today()->format('Y-m-d')],
            ['comment', 'default', 'value' => ''],
            // SCENARIO_EXPANSE
            ['expense', 'default', 'value' => 1, 'on' => self::SCENARIO_EXPANSE],
            ['income', 'default', 'value' => 0, 'on' => self::SCENARIO_EXPANSE],
            ['transfer', 'default', 'value' => 0, 'on' => self::SCENARIO_EXPANSE],
            // SCENARIO_INCOME
            ['expense', 'default', 'value' => 0, 'on' => self::SCENARIO_INCOME],
            ['income', 'default', 'value' => 1, 'on' => self::SCENARIO_INCOME],
            ['transfer', 'default', 'value' => 0, 'on' => self::SCENARIO_INCOME],
            // SCENARIO_TRANSFER
            ['expense', 'default', 'value' => 0, 'on' => self::SCENARIO_TRANSFER],
            ['income', 'default', 'value' => 0, 'on' => self::SCENARIO_TRANSFER],
            ['transfer', 'default', 'value' => 1, 'on' => self::SCENARIO_TRANSFER],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'amount' => 'Сумма',
            'amount_original' => 'Сумма (Ориг)',
            'currency_original' => 'Валюта (Ориг)',
            'date' => 'Дата',
            'currency_id' => 'Валюта',
            'account_id' => 'Счет',
            'category_id' => 'Категория',
            'recipient_currency_id' => 'Валюта получения',
            'recipient_account_id' => 'Счет получения',
            'comment' => 'Примечание',
            'transfer' => 'Перевод',
            'expense' => 'Расход',
            'income' => 'Доход',
            'external_id' => 'Внешний ID',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/transactions/$this->id", true);
            },
            'id',
            'date',
            'amount',
            'amountOriginal' => 'amount_original',
            'currencyOriginal' => 'currency_original',
            'currency' => function () {
                return $this->currency;
            },
            'account' => function () {
                return $this->account;
            },
            'category' => function () {
                return $this->category;
            },
            'recipientAmount' => 'recipient_amount',
            'recipientCurrency' => function () {
                return $this->recipientCurrency;
            },
            'recipientAccount' => function () {
                return $this->recipientAccount;
            },
            'comment',
            'expense',
            'income',
            'transfer',
            'userId' => 'user_id',
            'externalId' => 'external_id',
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

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCategory()
    {
        return $this->category_id === null ?
            null : $this->hasOne(Category::className(), ['id' => 'category_id']);
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
     * @return \yii\db\ActiveQuery
     */
    public function getRecipientCurrency()
    {
        return $this->recipient_currency_id === null ?
            null : $this->hasOne(Currency::className(), ['id' => 'recipient_currency_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getRecipientAccount()
    {
        return $this->recipient_account_id === null ?
            null : $this->hasOne(Account::className(), ['id' => 'recipient_account_id']);
    }

    /**
     * Checks relationships between objects by user
     * @param string $attribute
     * @param array $params
     */
    public function validateRelations($attribute, $params)
    {
        if (!$this->hasErrors()) {

            $currency = $this->currency;
            if ($currency->user_id !== null && $currency->user_id !== $this->user_id) {
                $this->addError('currency_id', "Значение «Currency Id» неверно");
            }

            $account = $this->account;
            if ($account->user_id !== $this->user_id) {
                $this->addError('account_id', "Значение «Account Id» неверно");
            }

            $category = $this->category;
            if ($category !== null && $category->user_id !== $this->user_id) {
                $this->addError('category_id', "Значение «Category Id» неверно");
            }

            if ($this->scenario === self::SCENARIO_TRANSFER) {

                $currency = $this->recipientCurrency;
                if ($currency->user_id !== null && $currency->user_id !== $this->user_id) {
                    $this->addError('recipient_currency_id', "Значение «Recipient Currency Id» неверно");
                }

                $account = $this->recipientAccount;
                if ($account->user_id !== $this->user_id) {
                    $this->addError('recipient_account_id', "Значение «Recipient Account Id» неверно");
                }
            }
        }
    }

    /**
     * Returns a value indicating whether the transaction is expense
     * @return bool
     */
    public function isExpense()
    {
        return $this->expense;
    }

    /**
     * Returns a value indicating whether the transaction is income
     * @return bool
     */
    public function isIncome()
    {
        return $this->income;
    }

    /**
     * Returns a value indicating whether the transaction is transfer
     * @return bool
     */
    public function isTransfer()
    {
        return $this->transfer;
    }

    /**
     * Returns array of available types of transactions
     * @return array
     */
    public static function types()
    {
        return [
            'expense',
            'income',
            'transfer',
        ];
    }

    /**
     * Create new transaction by type, received in parameter
     * @param string $type type of transaction
     * @return Transaction
     * @throws BadRequestHttpException
     */
    public static function create($type)
    {
        if (!in_array($type, self::types())) {
            throw new BadRequestHttpException("Значение параметра «type» неверно. Доступные значения " . implode(', ', self::types()));
        }

        return call_user_func(array(self::className(), $type));
    }

    /**
     * Create new expense transaction
     * @return Transaction
     */
    public static function expense()
    {
        return new Transaction([
            'scenario' => self::SCENARIO_EXPANSE,
        ]);
    }

    /**
     * Create new income transaction
     * @return Transaction
     */
    public static function income()
    {
        return new Transaction([
            'scenario' => self::SCENARIO_INCOME,
        ]);
    }

    /**
     * Create new transfer transaction
     * @return Transaction
     */
    public static function transfer()
    {
        return new Transaction([
            'scenario' => self::SCENARIO_TRANSFER,
        ]);
    }

    public static function search($params = [])
    {
        //для счета и валюты кастомная логика фильтров в TransactionController
        unset($params['account_id']);
        unset($params['currency_id']);

        return parent::search($params);
    }
}
