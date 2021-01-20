<?php

namespace app\models;

use Yii;
use yii\helpers\Url;

/**
 * This is the model class for table "category".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $name
 * @property string $icon
 * @property boolean $income
 * @property boolean $expense
 * @property boolean $active
 * @property boolean $watch
 * @property string $created_at
 * @property string $updated_at
 *
 * @property User $user
 */
class Category extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'category';
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_DEFAULT] = ['name', 'icon', 'income', 'expense', 'active', 'watch', '!user_id'];

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
            [['income', 'expense', 'watch'], 'default', 'value' => 0],
            ['active', 'default', 'value' => 1],
            ['income', function ($attribute, $params) {
                if (!$this->isIncome() && !$this->isExpense()) {
                    if ($this->isNewRecord) {
                        $this->expense = true;
                    } else {
                        $this->addError('income, expense', 'Нужно указать хотя бы одно назначение тега');
                    }
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
            'watch' => 'Отображать в дашборде',
        ];
    }

    /**
     * @inheritdoc
     */
    public function fields()
    {
        return [
            'href' => function () {
                return Url::to("/categories/$this->id", true);
            },
            'id',
            'name',
            'icon',
            'income',
            'expense',
            'active',
            'watch',
            'userId' => 'user_id',
            'countTrans' => function () {
                return (int)$this->hasMany(Transaction::className(), ['category_id' => 'id'])->count();
            }
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
     * Returns a value indicating whether the category is active
     * @return bool
     */
    public function isActive()
    {
        return $this->active;
    }

    /**
     * Returns a value indicating whether the category used as expense
     * @return bool
     */
    public function isExpense()
    {
        return $this->expense;
    }

    /**
     * Returns a value indicating whether the category used as income
     * @return bool
     */
    public function isIncome()
    {
        return $this->income;
    }

    /**
     * Returns a value indicating whether the category watched in dashboard
     * @return bool
     */
    public function isWatch()
    {
        return $this->watch;
    }
}
