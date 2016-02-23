<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\helpers\Url;
use yii\web\Link;
use yii\web\Linkable;

/**
 * Класс модели счетов, таблица - "account".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $name
 * @property string $color
 * @property integer $closed
 * @property date $closing_date
 */
class Account extends ActiveRecord implements Linkable
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'account';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'name'], 'required'],
            [['name'], 'string', 'min' => 1, 'max' => 255],
            [['color'], 'string', 'max' => 7]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'currency' => 'Валюта',
            'color' => 'Цвет',
            'closed' => 'Закрыт',
            'closing_date' => 'Дата закрытия',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'id',
            'name',
            'user_id',
            'link' => function ($model) {
                return "www.$model->name.com";
            }
        ];
    }

    /**
     * @inheritdoc
     */
    public function extraFields()
    {
        return [
            'balance' => function ($model) {
                return $model->getBalance();
            }
        ];
    }

    /**
     * @inheritdoc
     */
    public function getLinks()
    {
        return [
            Link::REL_SELF => Url::to(['view', 'id' => $this->id], true),
            'balance' => Url::to(['view', 'id' => $this->id, 'balance'], true),
        ];
    }


    public function getBalance()
    {
        return [
            'UAH' => 5200,
            'USD' => 1200,
        ];
    }
}
