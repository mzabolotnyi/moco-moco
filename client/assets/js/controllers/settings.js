App.controller('SettingsCtrl', ['$scope', 'notifyService', function ($scope, notifyService) {

        $scope.sections = {
            interface: {
                edit: false,
                data: [
                    {
                        name: 'Отображать панель виджетов',
                        //value: $scope.profile.displayWidgets
                    },
                    {
                        name: 'Отображать блок баланса',
                        //value: $scope.profile.displayBalance
                    },
                    {
                        name: 'Отображать блок графика',
                        //value: $scope.profile.displayChart
                    },
                    {
                        name: 'Отображать блок операций',
                        //value: $scope.profile.displayTransactions
                    }
                ]
            }
        };

        $scope.saveSettings = function (section) {
            notifyService.notify('Данные сохранены', 'error');
        }
    }]);
