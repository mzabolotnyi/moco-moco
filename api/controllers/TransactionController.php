<?php

namespace app\controllers;

use app\models\Transaction;
use Yii;
use yii\helpers\Url;
use yii\web\ServerErrorHttpException;

class TransactionController extends OActiveController
{
    public $modelClass = 'app\models\Transaction';
    public $pagination = [
        'pageSize' => 20
    ];

    /**
     * Creates a new transaction model.
     * @param string $type type of transaction 'expense'(default), 'income' or 'transfer'
     * @return \yii\db\ActiveRecordInterface the model newly created
     * @throws ServerErrorHttpException if there is any error when creating the model
     */
    public function actionCreate($type = 'expense')
    {
        /* @var $modelClass \app\models\Transaction */
        $modelClass = $this->modelClass;
        $model = $modelClass::create($type);
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');

        if ($this->controlOwner()
            || ($model->hasAttribute($this->nameUserIdAttr) && empty($model[$this->nameUserIdAttr]))
        ) {
            $model[$this->nameUserIdAttr] = $this->getUserId();
        }

        if ($model->save()) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(201);
            $response->getHeaders()->set('Location', Url::toRoute(['view', 'id' => $model->id], true));
        } elseif (!$model->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось создать объект по неизвестным причинам');
        }

        return $model;
    }

    /**
     * @inheritdoc
     */
    protected function prepareDataProvider()
    {
        $dataProvider = parent::prepareDataProvider();

        $queryParams = Yii::$app->request->queryParams;

        // filter by types
        if (isset($queryParams['types'])) {

            $types = explode(';', $queryParams['types']);
            $typesAvailable = ['expense', 'income', 'transfer'];
            $condition = null;

            foreach ($types as $type) {
                if (in_array($type, $typesAvailable)) {
                    $condition .= (!$condition ? '' : ' OR ') . "$type=1";
                }
            }

            if ($condition) {
                $dataProvider->query->andWhere($condition);
            }
        }

        if (isset($queryParams['account_id'])) {
            $value = $queryParams['account_id'];
            $dataProvider->query->andWhere("account_id=$value OR recipient_account_id=$value");
        }

        if (isset($queryParams['currency_id'])) {
            $value = $queryParams['currency_id'];
            $dataProvider->query->andWhere("currency_id=$value OR recipient_currency_id=$value");
        }

        return $dataProvider;
    }
}