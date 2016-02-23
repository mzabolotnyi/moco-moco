<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\filters\auth\HttpBearerAuth;
use Yii;
use yii\web\ForbiddenHttpException;

class ApiActiveController extends ActiveController
{
    /**
     * @var bool признак проверки прав доступа текущего пользователя
     * true: - возвращает модели, доступны текущему пользователю
     *       - при создании модели автоматически заполняет ID пользователя
     *       - при изменении или удалении модели проверяет права
     */
    protected $controlUserAccess = false;

    /**
     * @var string имя атрибута модели, определяющего пользователя-владельца
     */
    public $modelAttrUserId = 'user_id';

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        if ($this->controlUserAccess) {
            $behaviors['authenticator'] = ['class' => HttpBearerAuth::className()];
        }

        return $behaviors;
    }

    /**
     * @inheritdoc
     */
    public function actions()
    {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'indexDataProvider'];

        return $actions;
    }

    /**
     * @inheritdoc
     */
    public function checkAccess($action, $model = null, $params = [])
    {
        if ($this->needControlUserAccess()) {

            $actionList = $this->actionsCheckUserAccess();

            if (!in_array($action, $actionList)) {
                return true;
            }

            $userId = Yii::$app->user->getId();

            if ($userId != $model[$this->modelAttrUserId]) {
                throw new ForbiddenHttpException();
            }
        }
    }

    /**
     * Определяет список действий, перед выполнением которых нужно проверить права пользователя
     * @return array
     */
    public function actionsCheckUserAccess()
    {
        return [
            'view',
            'update',
            'delete',
        ];
    }

    /**
     * Определяет правила формирования ActiveDataProvider для actionIndex
     * с учетом прав пользователя и переданных в запросе фильтров
     * @return ActiveDataProvider
     * @throws ForbiddenHttpException
     */
    public function indexDataProvider()
    {
        $modelClass = $this->modelClass;
        $query = $modelClass::find();

        if ($this->needControlUserAccess()) {
            $userId = Yii::$app->user->getId();
            $query->andWhere([$this->modelAttrUserId => $userId]);
        }

        if (isset($_GET['filter'])) {
            $filter = json_decode($_GET['filter'], true);
            $query->andWhere($filter);
        }

        return new ActiveDataProvider([
            'query' => $query,
        ]);
    }

    /**
     * Проверяет необходимость контроля прав пользователя
     * @return bool
     */
    public function needControlUserAccess()
    {
        //учесть права админа!
        return $this->controlUserAccess;
    }
}