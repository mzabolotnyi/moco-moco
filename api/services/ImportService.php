<?php

namespace app\services;

use app\models\Account;
use app\models\Transaction;

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

            $transactions[] = $transaction;
        }
    }
}