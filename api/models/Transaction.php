<?php

namespace app\models;

/**
 * This is the model class for table "transaction".
 *
 * @property integer $id
 * @property string $created_at
 * @property string $updated_at
 */
class Transaction extends OActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'transaction';
    }
}
