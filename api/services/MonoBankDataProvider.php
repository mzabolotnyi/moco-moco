<?php

namespace app\services;

use app\models\CurrencyMapping;
use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;

class MonoBankDataProvider
{
    private $uri = 'https://api.monobank.ua';

    public static function create()
    {
        return new self();
    }

    public function getPayments(\DateTime $startDate, \DateTime $entDate, $token): array
    {
        $route = "/personal/statement/0/{$startDate->getTimestamp()}/{$entDate->getTimestamp()}";

        $client   = new Client();
        $response = $client->request('GET', $this->uri . $route, ['headers' => ['X-Token' => $token]]);

        return $this->parsePayments($response);
    }

    private function parsePayments(ResponseInterface $response): array
    {
        $responseData = json_decode($response->getBody()->getContents(), true);
        $payments     = [];

        foreach ($responseData as $paymentData) {
            $payments[] = $this->parsePayment($paymentData);
        }

        return $payments;
    }

    private function parsePayment($paymentData)
    {
        $amountData = $this->parseAmount($paymentData);

        $comment        = $paymentData['description'];
        $currencyNumber = $paymentData['currencyCode'];

        if ($currencyNumber && $currencyCode = CurrencyMapping::getCodeByNumber($currencyNumber)) {
            $amountOriginal = abs($paymentData['operationAmount'] / 100);
            $comment        = sprintf(
                '%s (%s %s)',
                $comment,
                number_format($amountOriginal, 2),
                $currencyCode
            );
        }

        return [
            'externalId' => $paymentData['id'],
            'date' => (new \DateTime())->setTimestamp($paymentData['time'])->format('Y-m-d'),
            'amount' => $amountData['amount'],
            'type' => $amountData['type'],
            'currency' => $amountData['currency'],
            'comment' => $comment,
        ];
    }

    private function parseAmount($data)
    {
        $amount = $data['amount'] / 100;

        if ($amount < 0) {
            $type   = 'expense';
            $amount = -$amount;
        } else {
            $type = 'income';
        }

        return [
            'amount' => (float)$amount,
            'type' => $type,
            'currency' => 'UAH'
        ];
    }
}