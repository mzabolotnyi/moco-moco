<?php

use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $email string */
/* @var $username string */
/* @var $serviceUrl string */

?>

<p><?= Html::encode($username) ?>!</p>

<p>
    Вы успешно зарегистрировались на сервисе <a href="<?= Html::encode($serviceUrl) ?>"
                                               target="_blank">MOCO-MOCO</a>
</p>

<p>
    Ваш email <a href="mailto:<?= Html::encode($email) ?>"
                target="_blank"><?= Html::encode($email) ?></a><br>
    Ваш пароль вы сами знаете.<br>
    Изменить его можно в профиле.
</p>

<p>
    Приятной работы с сервисом!
</p>

<p style="color: #888888">--<br>
    С уважением, <a href="<?= Html::encode($serviceUrl) ?>" target="_blank">MOCO-MOCO</a>
</p>


