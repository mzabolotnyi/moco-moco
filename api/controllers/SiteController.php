<?php

namespace app\controllers;

use yii\rest\Serializer;

class SiteController extends \yii\web\Controller
{
    public function actionError()
    {
        return [
            "name" => "Ресурс не найден",
            "message" => "Запрошенный ресурс не найден",
            "code" => 0,
            "status" => 404,
            "type" => "yii\\web\\NotFoundHttpException",
        ];
    }

    /**
     * Displays homepage.
     *
     * @return mixed
     */
    public function actionIndex()
    {
        $dataProvider = \app\models\Transaction::search(['id' => 3]);
        $dataProvider->query
            ->andWhere([
                'or',
                'account_id' => 3,
                'recipient_account_id' => 3
            ]);

        $r = new \app\models\Balance();
        $r->get();

//        \Yii::$app->cache->flush();
//
//        echo "<div style='margin: 100px'>$account->name</div>";
        echo "<div style='margin: 100px'></div>";

        foreach ($r->get() as $model) {
            $ser = new Serializer;
            echo json_encode($ser->serialize($model));
        }

        return $this->render('index');
    }
}
