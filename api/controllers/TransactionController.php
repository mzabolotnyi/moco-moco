<?php

namespace app\controllers;

use Yii;
use yii\helpers\Url;
use yii\web\ServerErrorHttpException;

class TransactionController extends OActiveController
{
    public $modelClass = 'app\models\Transaction';

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
}