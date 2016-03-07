<?php

use yii\db\Migration;

class m160307_065458_create_table_profile extends Migration
{
    public function up()
    {
        $this->createTable('table_profile', [
            'id' => $this->primaryKey()
        ]);
    }

    public function down()
    {
        $this->dropTable('table_profile');
    }
}
