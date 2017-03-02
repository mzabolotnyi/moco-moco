<?php
/**
 * This is the template for generating a CRUD controller class file.
 */

use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

$class = $generator->modelClass;
$pks = $class::primaryKey();

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

// save Item
$scope.save = function(){
    <?= $restName;?>.update({id:$scope.paramId},$scope.model,function(model){
<?php if(count($pks) > 1){
    echo "        id = [model.".  implode(', model.', $pks)."].join();\n";
}else{
    echo "        id = model.{$pks[0]};\n";
}?>
        $location.path('/<?= $prefixRoute; ?>' + id);
    },function(r){
        $scope.errors = {};
        $scope.errorStatus = r.status;
        $scope.errorText = r.statusTest;
        if (r.status == 422) {
            angular.forEach(r.data,function(err) {
                $scope.errors[err.field] = err.message;
            });
        }
    });
}

$scope.discard = function(){
    window.history.back();
}