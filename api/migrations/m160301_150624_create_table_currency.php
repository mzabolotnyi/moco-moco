<?php

use yii\db\Migration;

class m160301_150624_create_table_currency extends Migration
{
    public function up()
    {
        $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

        $this->createTable('currency', [
            'id' => $this->primaryKey(),
            'iso' => $this->string(3),
            'name' => $this->string(),
            'symbol' => $this->string(1),
            'user_id' => $this->integer(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ], $tableOptions);

        $this->addForeignKey('fk_user_currency', 'currency', 'user_id', 'user', 'id', 'RESTRICT', 'RESTRICT');

        $this->insert('currency', [
            'iso' => 'UAH',
            'name' => 'Украинская гривна',
            'symbol' => '₴',
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('currency', [
            'iso' => 'USD',
            'name' => 'Доллар США',
            'symbol' => '$',
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('currency', [
            'iso' => 'EUR',
            'name' => 'Евро',
            'symbol' => '€',
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('currency', [
            'iso' => 'RUB',
            'name' => 'Российский рубль',
            'symbol' => 'ք',
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('currency', [
            'iso' => 'GBP',
            'name' => 'Фунт стерлингов',
            'symbol' => '£',
            'created_at' => time(),
            'updated_at' => time(),
        ]);
    }

    public function down()
    {
        $this->dropTable('currency');
    }
}
