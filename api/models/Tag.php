<?php

namespace app\models;

use Yii;
use yii\helpers\Url;
use yii\web\Link;
use yii\web\Linkable;

/**
 * This is the model class for table "tag".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $name
 * @property string $icon
 * @property boolean $income
 * @property boolean $expense
 * @property boolean $active
 * @property string $created_at
 * @property string $updated_at
 */
class Tag extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'tag';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['name', 'icon', 'income', 'expense', 'active', '!user_id'];

        return $scenarios;
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'name'], 'required'],
            [['name'], 'string', 'max' => 255],
            [['icon'], 'string', 'max' => 255],
            [['income', 'expense', 'active'], 'boolean'],
            [['income', 'expense'], 'default', 'value' => 0],
            ['active', 'default', 'value' => 1],
            ['income', function ($attribute, $params) {
                if (!$this->isIncome() && !$this->isExpense()) {
                    $this->addError('income, expense', 'Нужно указать хотя бы одно назначение тега');
                }
            }, 'skipOnEmpty' => false],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'icon' => 'Иконка',
            'income' => 'Использовать в доходах',
            'expense' => 'Использовать в расходах',
            'active' => 'Активный',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/tags/$this->id", true);
            },
            'id',
            'name',
            'icon',
            'income',
            'expense',
            'active',
            'user_id',
        ];
    }

    /**
     * Returns a value indicating whether the tag is active
     * @return bool
     */
    public function isActive()
    {
        return $this->active;
    }

    /**
     * Returns a value indicating whether the tag used as expense
     * @return bool
     */
    public function isExpense()
    {
        return $this->expense;
    }

    /**
     * Returns a value indicating whether the tag used as income
     * @return bool
     */
    public function isIncome()
    {
        return $this->income;
    }
}
