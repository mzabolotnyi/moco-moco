<?php

use yii\db\Migration;

class m180624_072924_update_tables extends Migration
{
    public function safeUp()
    {
        $this->addColumn('account', 'merchant_id', $this->string(255));
        $this->addColumn('account', 'merchant_password', $this->string(255));
        $this->addColumn('account', 'card_number', $this->string(255));
        $this->addColumn('account', 'import_type', $this->string(255));
        $this->addColumn('account', 'import', $this->smallInteger(1)->defaultValue(0));

        $this->addColumn('transaction', 'external_id', $this->string(255));
    }

    public function safeDown()
    {
        $this->dropColumn('account', 'merchant_id');
        $this->dropColumn('account', 'merchant_password');
        $this->dropColumn('account', 'card_number');
        $this->dropColumn('account', 'import_type');
        $this->dropColumn('account', 'import');

        $this->dropColumn('transaction', 'external_id');
    }
}
