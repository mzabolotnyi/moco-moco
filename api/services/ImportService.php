<?php

namespace app\services;

use app\models\Account;
use app\models\Category;
use app\models\Transaction;
use yii\db\Query;

class ImportService
{
    const IMPORT_TYPE_PRIVATBANK = 'privatbank';

    public static function create()
    {
        return new ImportService();
    }

    public function getTransactionsForImport(\DateTime $startDate, \DateTime $entDate)
    {
        $accounts = Account::search(['import' => 1])->getModels();

        $transactions = [];
        foreach ($accounts as $account) {
            try {
                $this->addTransactionsByAccount($transactions, $account, $startDate, $entDate);
            } catch (\Exception $e) {
                throw $e;
            }
        }

        return $transactions;
    }

    private function addTransactionsByAccount(&$transactions, Account $account, \DateTime $startDate, \DateTime $entDate)
    {
        switch ($account->getImportType()) {
            case self::IMPORT_TYPE_PRIVATBANK:
                $cardNumber = $account->getCardNumber();
                $merchantId = $account->getMerchantId();
                $merchantPassword = $account->getMerchantPassword();
                $payments = PrivatBankDataProvider::create()->getPayments($startDate, $entDate, $cardNumber, $merchantId, $merchantPassword);
                break;
            default:
                $payments = [];
                break;
        }

        foreach ($payments as $payment) {

            if (Transaction::findOne(['external_id' => $payment['externalId']])) {
                continue;
            }

            $transaction = array_merge($payment, [
                'account' => $account,
                'currency' => $account->getCurrency($payment['currency'])
            ]);

            $transaction['category'] = $this->getCategory($transaction);

            $transactions[] = $transaction;
        }
    }

    private function getCategory($data)
    {
        $query = new Query();
        $query->select(['category_id'])
            ->from('transaction')
            ->where(['transaction.user_id' => \Yii::$app->user->getId()])
            ->andWhere(['transaction.comment' => $data['comment']])
            ->orderBy('date DESC')
            ->limit(1);

        $result = $query->all();

        return count($result) > 0 ? Category::findOne(['id' => $result[0]['category_id']]) : null;
    }
}