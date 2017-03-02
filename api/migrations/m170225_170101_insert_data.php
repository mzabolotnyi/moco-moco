<?php

class m170225_170101_insert_data extends \yii\db\Migration
{
    public function safeUp()
    {
        /**
         * RBAC
         */
        $this->insert('auth_item', ['name' => 'admin', 'type' => 1, 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('auth_item', ['name' => 'basic', 'type' => 1, 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('auth_item', ['name' => 'operateAll', 'type' => 2, 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('auth_item', ['name' => 'operateSelf', 'type' => 2, 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('auth_item', ['name' => 'premium', 'type' => 1, 'created_at' => time(), 'updated_at' => time()]);

        $this->insert('auth_item_child', ['parent' => 'admin', 'child' => 'operateAll']);
        $this->insert('auth_item_child', ['parent' => 'admin', 'child' => 'premium']);
        $this->insert('auth_item_child', ['parent' => 'basic', 'child' => 'operateSelf']);
        $this->insert('auth_item_child', ['parent' => 'premium', 'child' => 'basic']);

        /**
         * CURRENCIES
         */
        $this->insert('currency', ['iso' => 'UAH', 'name' => 'Украинская гривна', 'symbol' => '₴', 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('currency', ['iso' => 'USD', 'name' => 'Доллар США', 'symbol' => '$', 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('currency', ['iso' => 'EUR', 'name' => 'Евро', 'symbol' => '€', 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('currency', ['iso' => 'RUB', 'name' => 'Российский рубль', 'symbol' => 'ք', 'created_at' => time(), 'updated_at' => time()]);
        $this->insert('currency', ['iso' => 'GBP', 'name' => 'Фунт стерлингов', 'symbol' => '£', 'created_at' => time(), 'updated_at' => time()]);
    }

    public function safeDown()
    {
    }
}
