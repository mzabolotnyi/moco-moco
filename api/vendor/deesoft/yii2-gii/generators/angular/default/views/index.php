<?php

use yii\helpers\Inflector;
use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

$class = $generator->modelClass;
$pks = $class::primaryKey();
$rowKey = count($pks) > 1 ? "[model.".  implode(', model.', $pks)."].join()" : "model.{$pks[0]}";

$maxColumn = 6;
$prefixRoute = empty($generator->prefixRoute) ? '' : trim($generator->prefixRoute, '/') . '/';

echo "<?php\n";
?>
use dee\angular\NgView;
use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $widget NgView */

?>

<div class="<?= StringHelper::basename($generator->controllerID) ?>-index">
    <h1><?= "<?= " ?>Html::encode($this->title) ?></h1>
    <p>
        <?= "<?= " ?>Html::a('Create', '#/<?= $prefixRoute; ?>create', ['class' => 'btn btn-success']) ?>
    </p>
    <div class="grid-view">
        <table class="table table-striped table-bordered">
            <thead>
                <tr d-sort ng-model="provider.sort" ng-change="provider.sorting()" multisort="false">
                    <th>#</th>
<?php 
$count = 0;
foreach ($generator->getColumnNames() as $column){
    $count++;
    if($count == $maxColumn){
        echo "<!--\n";
    }
    $header = Inflector::id2camel($column);
    echo "                    <th><a href sort-field=\"$column\">{$header}</a></th>\n";
}
if($count >= $maxColumn){
    echo "-->\n";
}
?>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr ng-repeat="(no,model) in rows">
                    <td>{{(provider.page-1)*provider.itemPerPage + no + 1}}</td>
<?php
$count = 0;
foreach ($generator->getColumnNames() as $column){
    $count++;
    if($count == $maxColumn){
        echo "<!--\n";
    }
    echo "                    <td>{{model.{$column}}}</td>\n";
}
if($count >= $maxColumn){
    echo "-->\n";
}
?>
                    <td>
                        <a ng-href="#/<?= $prefixRoute; ?>{{<?= $rowKey?>}}"><span class="glyphicon glyphicon-eye-open"></span></a>
                        <a ng-href="#/<?= $prefixRoute; ?>{{<?= $rowKey?>}}/edit"><span class="glyphicon glyphicon-pencil"></span></a>
                        <a href ng-click="deleteModel(model)"><span class="glyphicon glyphicon-trash"></span></a>
                    </td>
                </tr>
            </tbody>
        </table>
        <pagination total-items="provider.totalItems" ng-model="provider.page"
                    max-size="5" items-per-page="provider.itemPerPage"
                    ng-change="provider.paging()"
                    class="pagination-sm" boundary-links="true"></pagination>
    </div>
</div>
