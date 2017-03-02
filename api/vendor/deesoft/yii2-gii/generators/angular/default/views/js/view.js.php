<?php
/**
 * This is the template for generating a CRUD controller class file.
 */

use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

$restName = StringHelper::basename($generator->modelClass);
$prefixRoute = empty($generator->prefixRoute) ? '' : trim($generator->prefixRoute, '/') . '/';
?>

$location = $injector.get('$location');
$routeParams = $injector.get('$routeParams');

$scope.paramId = $routeParams.id;
// model
<?= $restName;?>.get({id:$scope.paramId},function(row){
    $scope.model = row;
});

// delete Item
$scope.deleteModel = function(){
    if(confirm('Are you sure you want to delete')){
        <?= $restName;?>.remove({id:$scope.paramId},{},function(){
            $location.path('/<?= $prefixRoute; ?>');
        });
    }
}