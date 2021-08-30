<?php

namespace app\services;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Psr\Http\Message\ResponseInterface;

class PrivatBankDataProvider
{
    private $uri = 'https://api.privatbank.ua/p24api';

    public static function create()
    {
        return new self();
    }

    public function getPayments(\DateTime $startDate, \DateTime $entDate, $cardNumber, $merchantId, $merchantPassword)
    {
        $data = '<oper>cmt</oper>';
        $data .= '<wait>0</wait>';
        $data .= '<test>0</test>';
        $data .= '<payment id="">';
        $data .= '<prop name="sd" value="' . $startDate->format('d.m.Y') . '" />';
        $data .= '<prop name="ed" value="' . $entDate->format('d.m.Y') . '" />';
        $data .= '<prop name="card" value="' . $cardNumber . '" />';
        $data .= '</payment>';

        $sign = sha1(md5($data . $merchantPassword));

        $requestData = '<?xml version="1.0" encoding="UTF-8"?>';
        $requestData .= '<response version="1.0">';
        $requestData .= '<merchant>';
        $requestData .= '<id>' . $merchantId . '</id>';
        $requestData .= '<signature>' . $sign . '</signature>';
        $requestData .= '</merchant>';
        $requestData .= '<data>';
        $requestData .= $data;
        $requestData .= '</data>';
        $requestData .= '</response>';

        $client = new Client();
        $response = $client->request('POST', $this->uri . '/rest_fiz', [RequestOptions::BODY => $requestData]);

        return $this->parsePayments($response);
    }

    private function parsePayments(ResponseInterface $response)
    {
        $xml = $this->parseResponse($response);
        $assocArray = json_decode(json_encode($xml), true);
        $statementsData = $assocArray['data']['info']['statements'];
        $statements = isset($statementsData['statement']) ? $statementsData['statement'] : [];
        $payments = [];
        if (!empty($statements)) {
            if (isset($statements['@attributes'])) {
                $payments[] = $this->parsePayment($statements);
            } else {
                foreach ($statements as $statement) {
                    $payments[] = $this->parsePayment($statement);
                }
            }
        }
        return $payments;
    }

    private function parsePayment($statement)
    {
        $paymentData = $statement['@attributes'];
        $amountData = $this->parseAmount($paymentData['cardamount']);

        return [
            'externalId' => $paymentData['appcode'],
            'date' => $paymentData['trandate'],
            'amount' => $amountData['amount'],
            'type' => $amountData['type'],
            'currency' => $amountData['currency'],
            'comment' => $paymentData['description'],
        ];
    }

    private function parseAmount($data)
    {
        $parts = explode(' ', $data);
        $amount = $parts[0];
        $currency = $parts[1];

        if (substr($amount, 0, 1) === '-') {
            $type = 'expense';
            $amount = substr($amount, 1);
        } else {
            $type = 'income';
        }

        return [
            'amount' => (float)$amount,
            'type' => $type,
            'currency' => $currency
        ];
    }

    private function parseResponse(ResponseInterface $response)
    {
        return new \SimpleXMLElement($response->getBody()->getContents());
    }
}