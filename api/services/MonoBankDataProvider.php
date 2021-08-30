<?php

namespace app\services;

use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;

class MonoBankDataProvider
{
    const CURRENCY_MAPPING = [
        980 => 'UAH',
        840 => 'USD',
    ];

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

        return [
            'externalId' => $paymentData['id'],
            'date' => (new \DateTime())->setTimestamp($paymentData['time']),
            'amount' => $amountData['amount'],
            'type' => $amountData['type'],
            'currency' => $amountData['currency'],
            'comment' => $paymentData['description'],
        ];
    }

    private function parseAmount($data)
    {
        $amount       = $data['amount'] / 100;
        $currencyCode = $data['currencyCode'];

        if ($amount < 0) {
            $type   = 'expense';
            $amount = -$amount;
        } else {
            $type = 'income';
        }

        return [
            'amount' => (float)$amount,
            'type' => $type,
            'currency' => self::CURRENCY_MAPPING[$currencyCode]
        ];
    }
}