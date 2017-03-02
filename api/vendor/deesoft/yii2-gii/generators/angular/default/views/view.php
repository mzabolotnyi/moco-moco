<?php

use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

/* @var $model \yii\db\ActiveRecord */
$model = new $generator->modelClass();
$prefixRoute = empty($generator->prefixRoute) ? '' : trim($generator->prefixRoute, '/') . '/';

echo "<?php\n";
?>
use dee\angular\NgView;
use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $widget NgView */

?>

<div class="<?= StringHelper::basename($generator->controllerID) ?>-view">
    <h1><?= "<?= " ?>Html::encode($this->title) ?></h1>

    <p>
        <a ng-href="#/<?= $prefixRoute; ?>{{paramId}}/edit" class="btn btn-primary">Update</a>
        <a href ng-click="deleteModel()"class="btn btn-danger">Delete</a>
    </p>

    <table class="table table-striped table-bordered detail-view">
<?php foreach ($generator->getColumnNames() as $attribute){
    $label = $model->getAttributeLabel($attribute);
    echo "        <tr><th>{$label}</th><td>{{model.$attribute}}</td></tr>\n";
}?>
    </table>
</div>