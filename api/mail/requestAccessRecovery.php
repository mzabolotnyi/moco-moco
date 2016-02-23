<?php

use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $username string */
/* @var $passwordResetToken string */
/* @var $serviceUrl string */

?>

<p>
    <?= Html::encode($username) ?>, мы получили запрос на восстановление доступа к сервису <a
        href="<?= Html::encode($serviceUrl) ?>" target="_blank">MOCO-MOCO</a>.
</p>

<p>
    Если Вы не знаете о чем идет речь - проигнорируйте данное письмо.
</p>

<br>

<p>
    Ключ: <b><?= Html::encode($passwordResetToken) ?></b>
</p>

<br>

<p>
    Используйте данный ключ в форме восстановления доступа для получения временного пароля.
</p>

<p>
    Приятной работы с сервисом!
</p>

<p style="color: #888888">--<br>
    С уважением, <a href="<?= Html::encode($serviceUrl) ?>" target="_blank">MOCO-MOCO</a>
</p>


