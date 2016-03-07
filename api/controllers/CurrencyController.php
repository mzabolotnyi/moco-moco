<?php

namespace app\controllers;

use app\models\Currency;
use app\models\CurrencyRate;
use app\models\User;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\Transaction;
use yii\helpers\Url;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;

class CurrencyController extends OActiveController
{
    public $modelClass = 'app\models\Currency';

    /**
     * @inheritdoc
     */
    public function actionView($id)
    {
        /* @var $currency \app\models\Currency */
        $currency = Currency::findCurrency($id);

        return $currency;
    }

    /**
     * Returns ActiveDataProvider of currency rates or currency rate on date if param $date is defined
     * @param integer $id currency ID
     * @param string|null $date
     * @return CurrencyRate|ActiveDataProvider
     * @throws NotFoundHttpException
     */
    public function actionGetRates($id, $date = null)
    {
        $currency = Currency::findCurrency($id);

        if ($date === null) {
            return new ActiveDataProvider([
                'query' => $currency->hasMany(CurrencyRate::className(), ['currency_id' => 'id']),
            ]);
        } else {
            /* @var $currencyRate \app\models\CurrencyRate */
            $currencyRate = CurrencyRate::findRate($currency->id, $date);
            if ($currencyRate) {
                return $currencyRate;
            } else {
                throw new NotFoundHttpException("Ресурс не найден");
            }
        }
    }

    /**
     * Creates new currency rate on date
     * @param integer $id currency ID
     * @param string $date
     * @return CurrencyRate
     * @throws NotFoundHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionCreateRate($id, $date)
    {
        /* @var $model \app\models\Currency */
        $currency = Currency::findCurrency($id);

        $currencyRate = new CurrencyRate([
            'scenario' => $this->createScenario,
            'currency_id' => $currency->id,
            'date' => $date,
            'rate' => 1,
            'size' => 1,
        ]);

        $currencyRate->load(Yii::$app->getRequest()->getBodyParams(), '');

        if ($currencyRate->save()) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(201);
            $response->getHeaders()->set('Location', Url::to([
                '/currency/get-rates',
                'id' => $currencyRate->currency_id,
                'date' => $currencyRate->date
            ], true));
        } elseif (!$currencyRate->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось создать объект по неизвестным причинам');
        }

        return $currencyRate;
    }

    /**
     * Updates currency rate
     * @param integer $id currency ID
     * @param string|null $date
     * @return CurrencyRate
     * @throws ForbiddenHttpException
     * @throws NotFoundHttpException
     * @throws ServerErrorHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionUpdateRate($id, $date)
    {
        /* @var $currency \app\models\Currency */
        /* @var $currencyRate \app\models\CurrencyRate */
        $currency = Currency::findCurrency($id);
        $currencyRate = CurrencyRate::findRate($currency->id, $date);

        if ($currency->user_id !== $this->getUserId()) {
            throw new ForbiddenHttpException('Вам не разрешено выполнять это действие');
        }

        if ($currencyRate === null) {
            throw new NotFoundHttpException('Ресурс не найден');
        }

        $currencyRate->scenario = $this->updateScenario;
        $currencyRate->load(Yii::$app->getRequest()->getBodyParams(), '');

        if ($currencyRate->save() === false && !$currencyRate->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось изменить объект по неизвестным причинам');
        }

        return $currencyRate;
    }

    /**
     * Deletes currency rates or currency rate on date if param $date is defined
     * @param integer $id currency ID
     * @param string|null $date
     * @throws ForbiddenHttpException
     * @throws NotFoundHttpException
     * @throws ServerErrorHttpException
     * @throws \Exception
     */
    public function actionDeleteRates($id, $date = null)
    {
        /* @var $currency \app\models\Currency */
        $currency = Currency::findCurrency($id);

        if ($currency->user_id !== $this->getUserId()) {
            throw new ForbiddenHttpException('Вам не разрешено выполнять это действие');
        }

        if ($date === null) {
            CurrencyRate::deleteAll(['currency_id' => $currency->id]);
        } else {
            /* @var $currencyRate \app\models\CurrencyRate */
            $currencyRate = CurrencyRate::findRate($currency->id, $date);
            if ($currencyRate) {
                if ($currencyRate->delete() === false) {
                    throw new ServerErrorHttpException('Не удалось удалить объект по неизвестным причинам');
                }
            } else {
                throw new NotFoundHttpException("Ресурс не найден");
            }
        }

        Yii::$app->getResponse()->setStatusCode(204);
    }

    /**
     * @inheritdoc
     */
    protected function prepareDataProvider()
    {
        /* @var $modelClass \app\models\Currency */
        $modelClass = $this->modelClass;

        $queryParams = Yii::$app->request->queryParams;

        if ($this->controlOwner() || !isset($queryParams['all'])) {
            $queryParams[$this->nameUserIdAttr] = implode(';', [$this->getUserId(), 0, 'null']);
        }

        $dataProvider = $modelClass::search($queryParams);

        return $dataProvider;
    }

    /**
     * @inheritdoc
     * @param \app\models\Currency $model
     */
    protected function allowDelete($model)
    {
        $countTransactions = $model->hasMany(Transaction::className(), ['currency_id' => 'id'])->count();

        if ($countTransactions > 0) {
            throw new BadRequestHttpException("Необходимо удалить операции по валюте. Всего операций в базе - $countTransactions.");
        }

        return true;
    }
}