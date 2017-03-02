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
?>
var $location = $injector.get('$location');
var search = $location.search();
var $pageInfo = $injector.get('$pageInfo');

// data provider
$scope.provider = {
    sort: search.sort,
    paging: function () {
        search.page = $scope.provider.page;
        $location.search(search);
    },
    sorting:function(){
        search.sort = $scope.provider.sort;
        $location.search(search);
    }
};

// initial load
query = function(){
    <?= $restName;?>.query({
        page: search.page,
        sort: search.sort,
    }, function (rows, headerCallback) {
        $pageInfo(headerCallback, $scope.provider);
        $scope.rows = rows;
    });
}
query();

// delete Item
$scope.deleteModel = function(model){
    if(confirm('Are you sure you want to delete')){
<?php if(count($pks) > 1){
    echo "        id = [model.".  implode(', model.', $pks)."].join();\n";
}else{
    echo "        id = model.{$pks[0]};\n";
}?>
        <?= $restName;?>.remove({id:id},{},function(){
            query();
        });
    }
}