<?php

namespace app\controllers;

use app\models\AccountCurrency;
use app\models\Currency;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;

class AccountController extends OActiveController
{
    public $modelClass = 'app\models\Account';

    /**
     * Returns list of related currencies
     * @param $id account ID
     * @return array of a related currencies
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionGetCurrencies($id)
    {
        /** @var $model \app\models\Account */
        $model = $this->findModel($id);

        $currencyIDs = $model->hasMany(AccountCurrency::className(), ['account_id' => 'id'])
            ->select('currency_id')
            ->column();

        return Currency::findAll(['id' => $currencyIDs]);
    }

    /**
     * Binds currency with account
     * @param string $id account ID
     * @param string $currencyId currency ID
     * @throws BadRequestHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionBindCurrency($id, $currencyId)
    {
        /* @var $model \app\models\Account */
        $model = $this->findModel($id);
        $currency = Currency::findCurrency($currencyId);

        if ($currency->user_id !== null && $model->user_id !== $currency->user_id) {
            throw new BadRequestHttpException('Валюта принадлежит другому пользователю');
        }

        if (!$model->bindCurrency($currency)) {
            throw new ServerErrorHttpException('Не удалось выполнить действие по неизвестным причинам');
        }
    }

    /**
     * Unbinds currency from account
     * @param string $id account ID
     * @param string $currencyId currency ID
     * @throws ServerErrorHttpException
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionUnbindCurrency($id, $currencyId)
    {
        /* @var $model \app\models\Account */
        $model = $this->findModel($id);
        $currency = Currency::findCurrency($currencyId);

        if (!$model->unbindCurrency($currency)) {
            throw new ServerErrorHttpException('Не удалось выполнить действие по неизвестным причинам');
        }
    }
}