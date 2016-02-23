<?php

use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $username string */
/* @var $password string */
/* @var $serviceUrl string */

?>

<p>
    <?= Html::encode($username) ?>, в теле письма находится временный пароль для входа в сервис <a
        href="<?= Html::encode($serviceUrl) ?>" target="_blank">MOCO-MOCO</a>. Изменить пароль можно в профиле.
</p>

<br>

<p>
    Временный пароль: <b><?= Html::encode($password) ?></b>
</p>

<br>

<p>
    Приятной работы с сервисом!
</p>

<p style="color: #888888">--<br>
    С уважением, <a href="<?= Html::encode($serviceUrl) ?>" target="_blank">MOCO-MOCO</a>
</p>


