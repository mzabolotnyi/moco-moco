<?php

class m170225_170101_init_database extends \yii\db\Migration
{
    public function safeUp()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=InnoDB';
        }

        /**
         * TABLES
         */
        $this->createTable('account', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer(11)->notNull(),
            'name' => $this->string(255),
            'color' => $this->string(7)->defaultValue('#009688'),
            'active' => $this->smallInteger(1)->defaultValue(0),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->createTable('currency', [
            'id' => $this->primaryKey(),
            'iso' => $this->string(3),
            'name' => $this->string(255),
            'symbol' => $this->string(1),
            'user_id' => $this->integer(11),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->createTable('currency_rate', [
            'currency_id' => $this->integer(11)->notNull(),
            'date' => $this->date()->notNull(),
            'rate' => $this->double()->defaultValue(1),
            'size' => $this->integer(11)->defaultValue(1),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
            'PRIMARY KEY ([[currency_id]], [[date]])',
        ], $tableOptions);

        $this->createTable('account_currency', [
            'account_id' => $this->integer(11)->notNull(),
            'currency_id' => $this->integer(11)->notNull(),
            'is_balance' => $this->smallInteger(1)->notNull()->defaultValue(1),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
            'PRIMARY KEY ([[account_id]], [[currency_id]])',
        ], $tableOptions);

        $this->createTable('category', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer(11)->notNull(),
            'name' => $this->string(255),
            'icon' => $this->string(255)->defaultValue('fa-tag'),
            'income' => $this->smallInteger(1)->defaultValue(1),
            'expense' => $this->smallInteger(1)->defaultValue(1),
            'active' => $this->smallInteger(1)->defaultValue(0),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->createTable('transaction', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer(11)->notNull(),
            'currency_id' => $this->integer(11)->notNull(),
            'recipient_currency_id' => $this->integer(11),
            'account_id' => $this->integer(11)->notNull(),
            'recipient_account_id' => $this->integer(11),
            'category_id' => $this->integer(11),
            'amount' => $this->double(),
            'recipient_amount' => $this->double(),
            'date' => $this->date()->notNull(),
            'comment' => $this->string(255)->defaultValue(''),
            'transfer' => $this->smallInteger(1)->notNull(),
            'expense' => $this->smallInteger(1)->notNull(),
            'income' => $this->smallInteger(1)->notNull(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
        ], $tableOptions);

        $this->createTable('user', [
            'id' => $this->primaryKey(),
            'username' => $this->string(255)->notNull(),
            'auth_key' => $this->string(32)->notNull(),
            'password_hash' => $this->string(255)->notNull(),
            'password_reset_token' => $this->string(255),
            'email' => $this->string(255)->notNull(),
            'status' => $this->smallInteger(6)->notNull()->defaultValue(10),
            'created_at' => $this->integer(11)->notNull(),
            'updated_at' => $this->integer(11)->notNull(),
        ], $tableOptions);

        $this->createTable('user_access', [
            'user_id' => $this->integer(11)->notNull(),
            'token' => $this->string(255)->notNull(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
            'PRIMARY KEY ([[user_id]], [[token]])',
        ], $tableOptions);

        $this->createTable('user_profile', [
            'user_id' => $this->integer(11)->notNull(),
            'currency_id' => $this->integer(11),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
            'PRIMARY KEY ([[user_id]])',
        ], $tableOptions);

        $this->createTable('auth_assignment', [
            'item_name' => $this->string(64)->notNull(),
            'user_id' => $this->string(64)->notNull(),
            'created_at' => $this->integer(11),
            'PRIMARY KEY ([[item_name]], [[user_id]])',
        ], $tableOptions);

        $this->createTable('auth_item', [
            'name' => $this->string(64)->notNull(),
            'type' => $this->integer(11)->notNull(),
            'description' => $this->text(),
            'rule_name' => $this->string(64),
            'data' => $this->text(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
            'PRIMARY KEY ([[name]])',
        ], $tableOptions);

        $this->createTable('auth_item_child', [
            'parent' => $this->string(64)->notNull(),
            'child' => $this->string(64)->notNull(),
            'PRIMARY KEY ([[parent]], [[child]])',
        ], $tableOptions);

        $this->createTable('auth_rule', [
            'name' => $this->string(64)->notNull(),
            'data' => $this->text(),
            'created_at' => $this->integer(11),
            'updated_at' => $this->integer(11),
            'PRIMARY KEY ([[name]])',
        ], $tableOptions);

        /**
         * FOREIGN KEYS
         */
        $this->addForeignKey('fk_user_account', 'account', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_user_currency', 'currency', 'user_id', 'user', 'id', 'RESTRICT', 'RESTRICT');
        $this->addForeignKey('fk_c_r_currency', 'currency_rate', 'currency_id', 'currency', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_a_c_account', 'account_currency', 'account_id', 'account', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_a_c_currency', 'account_currency', 'currency_id', 'currency', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_user_category', 'category', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_user_transaction', 'transaction', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_currency_transaction', 'transaction', 'currency_id', 'currency', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_account_transaction', 'transaction', 'account_id', 'account', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_category_transaction', 'transaction', 'category_id', 'category', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_recipient_currency_transaction', 'transaction', 'recipient_currency_id', 'currency', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_recipient_account_transaction', 'transaction', 'recipient_account_id', 'account', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_user_access', 'user_access', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
        $this->addForeignKey('fk_user_profile', 'user_profile', 'user_id', 'user', 'id', 'CASCADE', 'RESTRICT');
    }

    public function safeDown()
    {
        /**
         * FOREIGN KEYS
         */
        $this->dropForeignKey('fk_user_account', 'account');
        $this->dropForeignKey('fk_user_currency', 'currency');
        $this->dropForeignKey('fk_c_r_currency', 'currency_rate');
        $this->dropForeignKey('fk_a_c_account', 'account_currency');
        $this->dropForeignKey('fk_a_c_currency', 'account_currency');
        $this->dropForeignKey('fk_user_category', 'category');
        $this->dropForeignKey('fk_user_transaction', 'transaction');
        $this->dropForeignKey('fk_currency_transaction', 'transaction');
        $this->dropForeignKey('fk_account_transaction', 'transaction');
        $this->dropForeignKey('fk_category_transaction', 'transaction');
        $this->dropForeignKey('fk_recipient_currency_transaction', 'transaction');
        $this->dropForeignKey('fk_recipient_account_transaction', 'transaction');
        $this->dropForeignKey('fk_user_access', 'user_access');
        $this->dropForeignKey('fk_user_profile', 'user_profile');

        /**
         * TABLES
         */
        $this->dropTable('account');
        $this->dropTable('currency');
        $this->dropTable('currency_rate');
        $this->dropTable('account_currency');
        $this->dropTable('category');
        $this->dropTable('transaction');
        $this->dropTable('user');
        $this->dropTable('user_access');
        $this->dropTable('user_profile');
        $this->dropTable('auth_assignment');
        $this->dropTable('auth_item');
        $this->dropTable('auth_item_child');
        $this->dropTable('auth_rule');
    }
}
