<?php

use yii\db\Migration;

class m160301_150703_create_table_account extends Migration
{
    public function up()
    {
        $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

        $this->createTable('account', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'name' => $this->string(),
            'color' => $this->string(7)->defaultValue('#009688'),
            'active' => $this->boolean()->defaultValue(0),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_user_account', 'account', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
    }

    public function down()
    {
        $this->dropTable('account');
    }
}
