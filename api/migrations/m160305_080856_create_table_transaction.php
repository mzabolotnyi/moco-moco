<?php

use yii\db\Migration;

class m160305_080856_create_table_transaction extends Migration
{
    public function up()
    {
        $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

        $this->createTable('transaction', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'account_id' => $this->integer()->notNull(),
            'tag_id' => $this->integer(),
            'amount' => $this->double(2),
            'date' => $this->date()->notNull(),
            'comment' => $this->string(),
            'transfer' => $this->boolean()->notNull(),
            'expense' => $this->boolean()->notNull(),
            'income' => $this->boolean()->notNull(),
            'primary_id' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_user_transaction', 'transaction', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_account_transaction', 'transaction', 'account_id', 'account', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_tag_transaction', 'transaction', 'tag_id', 'tag', 'id', 'CASCADE', 'RESTRICT');
    }

    public function down()
    {
        $this->dropTable('transaction');
    }
}
