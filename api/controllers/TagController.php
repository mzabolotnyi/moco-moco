<?php

namespace app\controllers;

use Yii;
use app\models\Transaction;
use yii\web\BadRequestHttpException;

class TagController extends OActiveController
{
    public $modelClass = 'app\models\Tag';

    /**
     * Returns ActiveDataProvider of transactions by tag
     * @param integer $id tag ID
     * @return ActiveDataProvider
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionGetTransactions($id)
    {
        /* @var $model \app\models\Tag */
        $model = $this->findModel($id);

        $queryParams = Yii::$app->request->queryParams;
        unset($queryParams['id']);

        $dataProvider = Transaction::search($queryParams);
        $dataProvider->query
            ->andWhere(['tag_id' => $model->id]);

        return $dataProvider;
    }

    /**
     * Deletes transactions by tag
     * @param integer $id tag ID
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionDeleteTransactions($id)
    {
        /* @var $model \app\models\Tag */
        $model = $this->findModel($id);

        Transaction::deleteAll(['tag_id' => $model->id]);

        Yii::$app->getResponse()->setStatusCode(204);
    }

    /**
     * @inheritdoc
     * @param \app\models\Currency $model
     */
    protected function allowDelete($model)
    {
        $countTransactions = $model->hasMany(Transaction::className(), ['tag_id' => 'id'])->count();

        if ($countTransactions > 0) {
            throw new BadRequestHttpException("Необходимо удалить операции по тегу. Всего операций в базе - $countTransactions.");
        }

        return true;
    }
}