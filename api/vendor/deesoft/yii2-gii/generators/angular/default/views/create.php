<?php

use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

echo "<?php\n";
?>
use dee\angular\NgView;
use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $widget NgView */

?>

<div class="<?= StringHelper::basename($generator->controllerID) ?>-create">

    <h1><?= "<?= " ?>Html::encode($this->title) ?></h1>

    <?= "<?= " ?>$this->render('_form', [
        'widget' => $widget,
    ]) ?>

</div>