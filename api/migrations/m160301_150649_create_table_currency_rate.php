<?php

use yii\db\Migration;

class m160301_150649_create_table_currency_rate extends Migration
{
    public function up()
    {
        $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

        $this->createTable('currency_rate', [
            'currency_id' => $this->integer(),
            'date' => $this->date(),
            'rate' => $this->double()->defaultValue(1),
            'size' => $this->integer()->defaultValue(1),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addPrimaryKey('pk_currency_date', 'currency_rate', [
            'currency_id',
            'date',
        ]);

        $this->addForeignKey('fk_currency', 'currency_rate', 'currency_id', 'currency', 'id', 'CASCADE', 'RESTRICT');
    }

    public function down()
    {
        $this->dropTable('currency_rate');
    }
}
