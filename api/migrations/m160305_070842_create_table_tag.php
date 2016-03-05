<?php

use yii\db\Migration;

class m160305_070842_create_table_tag extends Migration
{
    public function up()
    {
        $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

        $this->createTable('tag', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'name' => $this->string(),
            'icon' => $this->string()->defaultValue('fa-tag'),
            'income' => $this->boolean()->defaultValue(1),
            'expense' => $this->boolean()->defaultValue(1),
            'active' => $this->boolean()->defaultValue(0),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_user_tag', 'tag', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
    }

    public function down()
    {
        $this->dropTable('tag');
    }
}
