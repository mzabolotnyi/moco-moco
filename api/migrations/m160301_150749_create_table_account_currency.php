<?php

use yii\db\Migration;

class m160301_150749_create_table_account_currency extends Migration
{
    public function up()
    {
        $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

        $this->createTable('account_currency', [
            'account_id' => $this->integer()->notNull(),
            'currency_id' => $this->integer()->notNull(),
            'is_balance' => $this->boolean()->defaultValue(1),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addPrimaryKey('pk_account_currency', 'account_currency', [
            'account_id',
            'currency_id',
        ]);

        $this->addForeignKey('fk_a_c_account', 'account_currency', 'account_id', 'account', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_a_c_currency', 'account_currency', 'currency_id', 'currency', 'id', 'CASCADE', 'RESTRICT');
    }

    public function down()
    {
        $this->dropTable('account_currency');
    }
}
