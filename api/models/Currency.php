<?php

namespace app\models;

use yii\helpers\Url;
use yii\web\NotFoundHttpException;

/**
 * This is the model class for table "currency".
 *
 * @property integer $id
 * @property string $iso
 * @property string $name
 * @property string $symbol
 * @property string $user_id
 * @property string $created_at
 * @property string $updated_at
 *
 * @property User $user
 */
class Currency extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'currency';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['iso', 'name', 'symbol', '!user_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['iso', 'name', 'symbol', 'user_id'], 'required'],
            [['iso'], 'string', 'max' => 3],
            [['name'], 'string', 'max' => 255],
            [['symbol'], 'string', 'max' => 1],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'iso' => 'ISO',
            'name' => 'Название',
            'symbol' => 'Символьное обозначение',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/currencies/$this->id", true);
            },
            'id',
            'iso',
            'name',
            'symbol',
            'userId' => 'user_id',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->user_id === null ?
            null : $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    /**
     * Returns the currency based on the primary key given.
     * If the currency is not found or deny access, a 404 HTTP exception will be raised.
     * @param string $id the ID of the currency to be loaded.
     * @return \app\models\Currency the currency found
     * @throws NotFoundHttpException if the currency cannot be found
     */
    public static function findCurrency($id)
    {
        $model = self::findOne($id);

        if ($model === null) {
            throw new NotFoundHttpException('Ресурс не найден');
        }

        if (\Yii::$app->user->can(User::ROLE_ADMIN)) {
            return $model;
        }

        $modelOwnerId = $model->user_id;
        $availableOwnersId = [\Yii::$app->user->getId(), 0, null];

        if (!in_array($modelOwnerId, $availableOwnersId)) {
            throw new NotFoundHttpException('Ресурс не найден');
        }

        return $model;
    }
}
