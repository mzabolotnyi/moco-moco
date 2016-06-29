<?php

namespace app\controllers;

use Yii;
use app\models\Transaction;
use yii\web\BadRequestHttpException;

class CategoryController extends OActiveController
{
    public $modelClass = 'app\models\Category';

    /**
     * Returns ActiveDataProvider of transactions by category
     * @param integer $id category ID
     * @return ActiveDataProvider
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionGetTransactions($id)
    {
        /* @var $model \app\models\Category */
        $model = $this->findModel($id);

        $queryParams = Yii::$app->request->queryParams;
        unset($queryParams['id']);

        $dataProvider = Transaction::search($queryParams);
        $dataProvider->query
            ->andWhere(['category_id' => $model->id]);

        return $dataProvider;
    }

    /**
     * Deletes transactions by category
     * @param integer $id category ID
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionDeleteTransactions($id)
    {
        /* @var $model \app\models\Category */
        $model = $this->findModel($id);

        Transaction::deleteAll(['category_id' => $model->id]);

        Yii::$app->getResponse()->setStatusCode(204);
    }

    /**
     * @inheritdoc
     * @param \app\models\Currency $model
     */
    protected function allowDelete($model)
    {
        $countTransactions = $model->hasMany(Transaction::className(), ['category_id' => 'id'])->count();

        if ($countTransactions > 0) {
            throw new BadRequestHttpException("Необходимо удалить операции по категории. Всего операций в базе - $countTransactions.");
        }

        return true;
    }
}