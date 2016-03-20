<?php

use yii\db\Migration;

class m160307_065458_create_table_profile extends Migration
{
    public function up()
    {
        $this->createTable('user_profile', [
            'user_id' => $this->integer()->notNull(),
            'currency_id' => $this->integer(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ]);

        $this->addPrimaryKey('pk_user_profile', 'user_profile', 'user_id');
        $this->addForeignKey('fk_user_profile', 'user_profile', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_currency_profile', 'user_profile', 'currency_id', 'currency', 'id', 'SET NULL', 'RESTRICT');
    }

    public function down()
    {
        $this->dropTable('user_profile');
    }
}
