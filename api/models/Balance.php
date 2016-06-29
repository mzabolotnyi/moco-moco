<?php

namespace app\models;

use Yii;
use Carbon\Carbon;
use yii\base\Model;
use yii\db\Expression;
use yii\db\Query;
use yii\helpers\Url;
use yii\web\ServerErrorHttpException;

/**
 * Class Balance using for calculation balance on account
 */
class Balance extends Model
{
    const SCENARIO_GET = 'get';
    const SCENARIO_ADJUST = 'adjust';

    public $date;
    public $accountId;
    public $currencyId;
    public $amount;
    public $comment = 'Корректировка баланса';

    private $_currencies = [];
    private $_accounts = [];

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();

        $scenarios[self::SCENARIO_GET] = ['date', 'accountId', 'currencyId', 'amount'];
        $scenarios[self::SCENARIO_ADJUST] = ['date', 'accountId', 'currencyId', 'amount'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'date' => 'Дата',
            'accountId' => 'Account ID',
            'currencyId' => 'Currency ID',
            'amount' => 'Сумма баланса',
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['accountId', 'currencyId', 'amount'], 'required', 'on' => self::SCENARIO_ADJUST],
            ['date', 'date', 'format' => 'yyyy-MM-dd'],
            ['amount', 'number', 'numberPattern' => '/^[-+]?[0-9]*\.?[0-9]{1,2}$/'],
            ['currencyId', 'exist', 'targetClass' => Currency::className(), 'targetAttribute' => ['currencyId' => 'id']],
            ['accountId', 'exist', 'targetClass' => Account::className(), 'targetAttribute' => ['accountId' => 'id']],
            ['date', 'default', 'value' => Carbon::today()->format('Y-m-d')],
            ['currencyId', 'default', 'value' => null],
            ['accountId', 'default', 'value' => null],
        ];
    }

    /**
     * Adjusts balance by account and currency.
     * Creates an adjustment transaction on the difference between current balance and transferred ('amount')
     * @return array
     */
    public function adjust()
    {
        $balanceData = $this->get();

        $currentBalance = 0;
        if (count($balanceData) > 0) {
            $currentBalance = $balanceData[0]['amount'];
        }

        return $this->createTransaction($currentBalance);
    }

    /**
     * Returns array of balance data
     * @return array
     */
    public function get()
    {
        $queryResult = $this->buildQuery()->all();
        return $this->prepareBalanceData($queryResult);
    }

    /**
     * Builds query for getting balance data
     * @return \yii\db\Query
     */
    protected function buildQuery()
    {
        $userId = Yii::$app->user->getId();

        $subQuery = new Query();
        $subQuery->select([
            new Expression('CASE
              WHEN expense
                   OR transfer THEN -amount
              WHEN income THEN amount
              ELSE 0
             END AS amount'),
            'account_id',
            'currency_id',
        ])->from('transaction')
            ->where(['user_id' => $userId])
            ->andWhere(['is not', 'account_id', null])
            ->andWhere(['<=', 'date', $this->date]);

        $subQuery2 = new Query();
        $subQuery2->select([
            'recipient_amount',
            'recipient_account_id',
            'recipient_currency_id',
        ])->from('transaction')
            ->where(['user_id' => $userId])
            ->andWhere(['is not', 'recipient_account_id', null])
            ->andWhere(['<=', 'date', $this->date]);

        $subQuery->union($subQuery2, true);

        $queryMain = new Query();
        $queryMain->select([
            'SUM(balance.amount) AS amount',
            'balance.account_id AS account_id',
            'balance.currency_id AS currency_id',
        ])->from(['balance' => $subQuery])
            ->leftJoin(
                'account_currency AS ac',
                'balance.account_id = ac.account_id AND balance.currency_id = ac.currency_id'
            )->where(['ac.is_balance' => true])
            ->orWhere(['ac.is_balance' => null])
            ->groupBy(['balance.account_id', 'balance.currency_id'])
            ->orderBy('account_id, currency_id');

        if ($this->accountId !== null) {
            $queryMain->andWhere(['balance.account_id' => $this->accountId]);
        }

        if ($this->currencyId !== null) {
            $queryMain->andWhere(['balance.currency_id' => $this->currencyId]);
        }

        return $queryMain;
    }

    /**
     * Prepares balance data array based on query result
     * @param array $queryResult
     * @return array
     */
    protected function prepareBalanceData($queryResult)
    {
        $balanceData = [];
        $mainCurrency = Currency::getMainCurrency();

        foreach ($queryResult as $row) {

            $accountId = $row['account_id'];
            $currencyId = $row['currency_id'];
            $balanceDataByRow = $this->prepareBalanceDataByRow($row);

            if (!isset($balanceData[$accountId])) {
                $balanceData[$accountId] = [];
                $balanceData[$accountId]['account'] = $this->getAccount($accountId);
                $balanceData[$accountId]['currencies'] = [];

                //сумма общего баланса, включая валютные счете в основной валюте по курсу
                $balanceData[$accountId]['amount'] = 0;

                //сумма баланса только в основной валюте, исключая остаток в валюте
                $balanceData[$accountId]['amountInMainCurrency'] = 0;
            }

            $balanceData[$accountId]['currencies'][] = $balanceDataByRow;
            $balanceData[$accountId]['amount'] += $balanceDataByRow['amountInMainCurrency'];

            if ($currencyId == $mainCurrency->id) {
                $balanceData[$accountId]['amountInMainCurrency'] += $balanceDataByRow['amountInMainCurrency'];
            }
        }

        return array_values($balanceData);
    }

    /**
     * Prepares balance data array based on row of query result
     * @param array $row
     * @return array
     */
    protected function prepareBalanceDataByRow($row)
    {
        $currency = $this->getCurrency($row['currency_id']);
        $amount = round((double)$row['amount'], 2);
        $amountInMainCurrency = Currency::convertToMainCurrency($amount, $currency, $this->date);

        return [
            'currency' => $currency,
            'amount' => $amount,
            'amountInMainCurrency' => $amountInMainCurrency,
        ];
    }

    /**
     * Returns currency by ID
     * @param string $id currency ID
     * @return Currency|null
     */
    protected function getCurrency($id)
    {
        if (isset($this->_currencies[$id])) {
            $currency = $this->_currencies[$id];
        } else {
            $currency = Currency::findOne($id);
            $this->_currencies[$id] = $currency;
        }

        return $currency;
    }

    /**
     * Returns account by ID
     * @param string $id account ID
     * @return Account|null
     */
    protected function getAccount($id)
    {
        if (isset($this->_accounts[$id])) {
            $account = $this->_accounts[$id];
        } else {
            $account = Account::findOne($id);
            $this->_accounts[$id] = $account;
        }

        return $account;
    }

    /** Creates an adjustment transaction on the difference between current balance and transferred ('amount')
     * @param double $currentBalance current balance
     * @return Transaction|array
     * @throws ServerErrorHttpException
     */
    protected function createTransaction($currentBalance)
    {
        $diff = round($this->amount - $currentBalance, 2);

        if ($diff < 0) {
            $amount = -$diff;
            $scenario = Transaction::SCENARIO_EXPANSE;
        } elseif ($diff > 0) {
            $amount = $diff;
            $scenario = Transaction::SCENARIO_INCOME;
        } else {
            return [];
        }

        $model = new Transaction([
            'scenario' => $scenario,
        ]);
        $model->amount = $amount;
        $model->account_id = $this->accountId;
        $model->currency_id = $this->currencyId;
        $model->user_id = Yii::$app->user->getId();
        $model->comment = $this->comment;

        if ($model->save()) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(201);
            $response->getHeaders()->set('Location', Url::toRoute(['view', 'id' => $model->id], true));
        } elseif (!$model->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось выполнить корректировку баланса по неизвестным причинам');
        }

        return $model;
    }
}