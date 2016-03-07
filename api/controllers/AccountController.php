<?php

namespace app\controllers;

use Yii;
use app\models\AccountCurrency;
use app\models\Currency;
use app\models\Transaction;
use yii\data\ActiveDataProvider;
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

    /**
     * Returns ActiveDataProvider of transactions by account
     * @param integer $id account ID
     * @return ActiveDataProvider
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionGetTransactions($id)
    {
        /* @var $model \app\models\Account */
        $model = $this->findModel($id);

        $queryParams = Yii::$app->request->queryParams;
        unset($queryParams['id']);

        $dataProvider = Transaction::search($queryParams);
        $dataProvider->query
            ->andWhere([
                'or',
                ['account_id' => $model->id],
                ['recipient_account_id' => $model->id],
            ]);

        return $dataProvider;
    }

    /**
     * Deletes transactions by account
     * @param integer $id account ID
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionDeleteTransactions($id)
    {
        /* @var $model \app\models\Account */
        $model = $this->findModel($id);

        Transaction::deleteAll([
            'or',
            ['account_id' => $model->id],
            ['recipient_account_id' => $model->id],
        ]);

        Yii::$app->getResponse()->setStatusCode(204);
    }

    /**
     * @inheritdoc
     * @param \app\models\Currency $model
     */
    protected function allowDelete($model)
    {
        $countTransactions = $model->hasMany(Transaction::className(), ['account_id' => 'id'])->count()
            + $model->hasMany(Transaction::className(), ['recipient_account_id' => 'id'])->count();

        if ($countTransactions > 0) {
            throw new BadRequestHttpException("Необходимо удалить операции по счету. Всего операций в базе - $countTransactions.");
        }

        return true;
    }
}