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

    private function parsePayment($paymentData): array
    {
        $amountData = $this->parseAmount($paymentData);

        return [
            'externalId' => $paymentData['id'],
            'date' => (new \DateTime())->setTimestamp($paymentData['time'])->format('Y-m-d'),
            'amount' => $amountData['amount'],
            'type' => $amountData['type'],
            'currency' => $amountData['currency'],
            'comment' => $paymentData['description'],
            'amountOriginal' => $amountData['amountOriginal'],
            'currencyOriginal' => $amountData['currencyOriginal'],
        ];
    }

    private function parseAmount($data): array
    {
        $amount = $data['amount'] / 100;

        return [
            'type' => $amount < 0 ? 'expense' : 'income',
            'amount' => abs($amount),
            'currency' => 'UAH',
            'amountOriginal' => abs($data['operationAmount'] / 100),
            'currencyOriginal' => CurrencyMapping::getCodeByNumber($data['currencyCode'])
        ];
    }
}