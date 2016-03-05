<?php

namespace app\controllers;

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
        $models = \app\models\Currency::search(['user_id' => implode(';', [22, 0, 'null'])]);

//        \Yii::$app->cache->flush();
//
//        echo "<div style='margin: 100px'>$account->name</div>";
        echo "<div style='margin: 100px'></div>";

        foreach ($models->getModels() as $model) {
            echo "<div>$model->id - " . $model->user_id . "</div>";
        }

        return $this->render('index');
    }
}
