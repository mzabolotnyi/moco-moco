<?php

namespace app\controllers;

use yii\filters\AccessControl;
use yii\filters\RateLimiter;
use yii\helpers\Url;
use yii\rest\ActiveController;
use yii\data\ActiveDataProvider;
use yii\filters\auth\HttpBearerAuth;
use Yii;
use app\models\User;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;

/**
 * OActiveController implements a common set of actions for supporting RESTful access to ActiveRecord.
 *
 * The class of the OActiveController should be specified via [[modelClass]], which must implement [[\yii\db\ActiveRecordInterface]].
 * By default, the following actions are supported:
 *
 * - `index`: list of models
 * - `view`: return the details of a model
 * - `create`: create a new model
 * - `update`: update an existing model
 * - `delete`: delete an existing model
 *
 * By default if user is not admin - he can operate only whit self models.
 * This behavior can be canceled by setting attribute 'nameAttributeUserId' to false
 */
class OActiveController extends ActiveController
{
    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////ATTRIBUTES///////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @var string name of model's attribute, that determines ID of user-owner
     */
    public $nameUserIdAttr = 'user_id';

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////OVERRIDE INHERIT FUNCTIONS///////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        if ($this->nameUserIdAttr !== false) {
            $behaviors['authenticator'] = ['class' => HttpBearerAuth::className()];
            $behaviors['accessControl'] = [
                'class' => AccessControl::className(),
                'rules' => [
                    // allow users with basic role and higher
                    [
                        'allow' => true,
                        'roles' => [User::ROLE_BASIC],
                    ],
                ],
            ];
        }

        $behaviors['rateLimiter'] = [
            'class' => RateLimiter::className(),
            'errorMessage' => 'Превышен лимит запросов',
        ];

        return $behaviors;
    }

    /**
     * @inheritdoc
     */
    public function actions()
    {
        return [];
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////ACTIONS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @return ActiveDataProvider
     */
    public function actionIndex()
    {
        return $this->prepareDataProvider();
    }

    /**
     * Creates a new model.
     * @return \yii\db\ActiveRecordInterface the model newly created
     * @throws ServerErrorHttpException if there is any error when creating the model
     */
    public function actionCreate()
    {
        /* @var $model \yii\db\ActiveRecord */
        $model = new $this->modelClass([
            'scenario' => $this->createScenario,
        ]);

        $model->load(Yii::$app->getRequest()->getBodyParams(), '');

        if ($this->controlOwner()
            || ($model->hasAttribute($this->nameUserIdAttr) && empty($model[$this->nameUserIdAttr]))
        ) {
            $model[$this->nameUserIdAttr] = $this->getUserId();
        }

        if ($model->save()) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(201);
            $id = implode(',', array_values($model->getPrimaryKey(true)));
            $response->getHeaders()->set('Location', Url::toRoute(['view', 'id' => $id], true));
        } elseif (!$model->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось создать объект по неизвестным причинам');
        }

        return $model;
    }

    /**
     * Displays a model.
     * @param string $id the primary key of the model.
     * @return \yii\db\ActiveRecordInterface the model being displayed
     */
    public function actionView($id)
    {
        /* @var $model \yii\db\ActiveRecord */
        $model = $this->findModel($id);

        return $model;
    }

    /**
     * Updates an existing model.
     * @param string $id the primary key of the model.
     * @return \yii\db\ActiveRecordInterface the model being updated
     * @throws ServerErrorHttpException if there is any error when updating the model
     */
    public function actionUpdate($id)
    {
        /* @var $model \yii\db\ActiveRecord */
        $model = $this->findModel($id);

        $model->scenario = $this->updateScenario;
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        if ($model->save() === false && !$model->hasErrors()) {
            throw new ServerErrorHttpException('Не удалось изменить объект по неизвестным причинам');
        }

        return $model;
    }

    /**
     * Deletes a model.
     * @param mixed $id id of the model to be deleted.
     * @throws BadRequestHttpException on failure.
     * @throws ServerErrorHttpException on failure.
     */
    public function actionDelete($id)
    {
        /* @var $model \yii\db\ActiveRecord */
        $model = $this->findModel($id);

        if (!$this->allowDelete($model)) {
            throw new BadRequestHttpException('Существуют объекты зависимые от ресурса');
        }

        if ($model->delete() === false) {
            throw new ServerErrorHttpException('Не удалось удалить объект по неизвестным причинам');
        }

        Yii::$app->getResponse()->setStatusCode(204);
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////SERVICE FUNCTIONS///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Checks the privilege of the current user.
     *
     * If the user does not have access, a [[ForbiddenHttpException]] should be thrown.
     *
     * @param object $model the model to be accessed
     * @throws NotFoundHttpException if the user does not have access
     */
    protected function verifyAccess($model)
    {
        if ($this->controlOwner()) {
            if ($model[$this->nameUserIdAttr] !== $this->getUserId()) {
                throw new NotFoundHttpException("Ресурс не найден");
            }
        }
    }

    /**
     * Checks the ability to remove resource. Method can be implement in child classes
     * @param object $model the model to be accessed
     * @return bool
     */
    protected function allowDelete($model)
    {
        return true;
    }

    /**
     * Check the owner's need for control
     * @return bool
     */
    protected function controlOwner()
    {
        return $this->nameUserIdAttr !== false && !Yii::$app->user->can('operateAll');
    }

    /**
     * Return ID of current logged user
     * @return int|string
     */
    protected function getUserId()
    {
        return Yii::$app->user->getId();
    }

    /**
     * Prepares the data provider that should return the requested collection of the models.
     * @return ActiveDataProvider
     */
    protected function prepareDataProvider()
    {
        /* @var $modelClass \yii\db\BaseActiveRecord */
        $modelClass = $this->modelClass;

        if (isset(class_implements($modelClass)['app\models\ISearchable'])) {

            $queryParams = Yii::$app->request->queryParams;

            if ($this->controlOwner() || !isset($queryParams['all'])) {
                $queryParams[$this->nameUserIdAttr] = $this->getUserId();
            }

            $dataProvider = $modelClass::search($queryParams);
        } else {

            $query = $modelClass::find();

            if ($this->controlOwner() || !isset($queryParams['all'])) {
                $query->andWhere([$this->nameUserIdAttr => $this->getUserId()]);
            }

            $dataProvider = new ActiveDataProvider([
                'query' => $query,
            ]);
        }

        return $dataProvider;
    }

    /**
     * Returns the data model based on the primary key given.
     * If the data model is not found, a 404 HTTP exception will be raised.
     * @param string $id the ID of the model to be loaded.
     * The order of the primary key values should follow that returned by the `primaryKey()` method
     * of the model.
     * @return \yii\db\ActiveRecordInterface the model found
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        /* @var $modelClass \yii\db\ActiveRecordInterface */
        $modelClass = $this->modelClass;
        $model = $modelClass::findOne($id);

        if ($model !== null) {
            $this->verifyAccess($model);
            return $model;
        } else {
            throw new NotFoundHttpException('Ресурс не найден');
        }
    }
}