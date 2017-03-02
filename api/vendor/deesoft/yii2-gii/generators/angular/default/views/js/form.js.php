$scope.errors = {};

jQuery('form').on('keypress change',':input[ng-model]',function(){
    var field = $(this).attr('name');
    if($scope.errorStatus){
        delete $scope.errorStatus;
        delete $scope.errorText;
    }
    if($scope.errors[field]){
        delete $scope.errors[field];
    }
});