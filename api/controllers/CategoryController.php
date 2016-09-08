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
     * Update transactions by category
     * @param integer $id category ID
     * @return bool
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionUpdateTransactions($id)
    {
        /* @var $model \app\models\Category */
        $model = $this->findModel($id);

        /* Заполним массив аттрибутов, которые могут изменятся */
        $updateAttributes = [];
        $bodyParams = Yii::$app->getRequest()->getBodyParams();

        if (!empty($bodyParams['category_id'])) {
            /* @var $newCategory \app\models\Category */
            $newCategory = $this->findModel($bodyParams['category_id']);
            $updateAttributes['category_id'] = $newCategory->id;
        }

        if (count($updateAttributes) > 0)
            return Transaction::updateAll($updateAttributes, ['category_id' => $model->id]);
        else {
            return 0;
        }
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