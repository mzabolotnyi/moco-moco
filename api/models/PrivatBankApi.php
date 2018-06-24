<?php

namespace app\models;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Psr\Http\Message\ResponseInterface;

class PrivatBankApi
{
    private $uri = 'https://api.privatbank.ua/p24api';

    public static function create()
    {
        return new PrivatBankApi();
    }

    public function getPayments($startDate, $entDate, Account $account)
    {
        $startDate = \DateTime::createFromFormat('Y-m-d', $startDate)->format('d.m.Y');
        $entDate = \DateTime::createFromFormat('Y-m-d', $entDate)->format('d.m.Y');
        $card = '5167985560041378';
        $merchantId = 136851;
        $merchantPassword = 'Z6TxHWwY99DBgBy3Yjgo6kwqG98q05s5';

        $data = '<oper>cmt</oper>';
        $data .= '<wait>0</wait>';
        $data .= '<test>0</test>';
        $data .= '<payment id="">';
        $data .= '<prop name="sd" value="' . $startDate . '" />';
        $data .= '<prop name="ed" value="' . $entDate . '" />';
        $data .= '<prop name="card" value="' . $card . '" />';
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
        $statements = $assocArray['data']['info']['statements']['statement'];
        $payments = [];
        foreach ($statements as $statement) {
            $paymentData = $statement['@attributes'];
            $amountData = $this->parseAmount($paymentData['cardamount']);
            $payments[] = [
                'id' => $paymentData['appcode'],
                'date' => $paymentData['trandate'],
                'amount' => $amountData['amount'],
                'type' => $amountData['type'],
                'currency' => $amountData['currency'],
                'description' => $paymentData['description'],
            ];
        }
        return $payments;
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