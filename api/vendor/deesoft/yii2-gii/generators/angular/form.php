<?php
/* @var $this yii\web\View */
/* @var $form yii\widgets\ActiveForm */
/* @var $generator dee\gii\generators\angular\Generator */

echo $form->field($generator, 'modelClass');
echo $form->field($generator, 'controllerID');
echo $form->field($generator, 'baseControllerClass');
echo $form->field($generator, 'restControllerID');
echo $form->field($generator, 'baseRestControllerClass');
echo $form->field($generator, 'prefixRoute');
echo $form->field($generator, 'enableI18N')->checkbox();
echo $form->field($generator, 'messageCategory');
