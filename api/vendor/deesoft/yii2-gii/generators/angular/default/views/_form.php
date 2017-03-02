<?php

use yii\helpers\Html;
use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

/* @var $model \yii\db\ActiveRecord */
$model = new $generator->modelClass();
$safeAttributes = $model->safeAttributes();
if (empty($safeAttributes)) {
    $safeAttributes = $model->attributes();
}

echo "<?php\n";
?>
use dee\angular\NgView;

/* @var $this yii\web\View */
/* @var $widget NgView */

$widget->renderJs('js/form.js');
?>

<div class="<?= StringHelper::basename($generator->controllerID) ?>-form">
    <form name="Form" >
        <div ng-if="errorStatus">
            <h1>Error {{errorStatus}}: {{errorText}}</h1>
            <ul>
                <li ng-repeat="(field,msg) in errors">{{field}}: {{msg}}</li>
            </ul>
        </div>

<?php foreach ($generator->getColumnNames() as $attribute){
    if (in_array($attribute, $safeAttributes)) {
        $containerCls = 'form-group'.($model->isAttributeRequired($attribute)?' required':'');
        $attrLabel = $model->getAttributeLabel($attribute);
        $attrId = Html::getInputId($model, $attribute);
        echo <<<FIELD
        <div class="{$containerCls}" ng-class="{error:!!errors.{$attribute}}">
            <label for="{$attrId}" class="control-label">{$attrLabel}</label>
            <input id="{$attrId}" name="{$attribute}" class="form-control" ng-model="model.{$attribute}">
            <div class="help-block" ng-bind"errors.{$attribute}"></div>
        </div>

FIELD;
        
    }
} ?>
        <div class="form-group">
            <button class="btn btn-primary" ng-click="save()">Save</button>
            <button class="btn btn-danger" ng-click="discard()">Save</button>
        </div>
    </form>
</div>