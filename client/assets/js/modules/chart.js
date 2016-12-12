// Create new angular module
var TransactionModule = angular.module('mocoChart', []);

// Defining logic
CategoryModule
    .constant('chartConfig', {
        baseUrl: 'analytics',
        startPeriodParamName: 'startDate',
        endPeriodParamName: 'endDate'
    })
    .factory('chartUtils', ['config', 'chartConfig', 'httpHelper', function (appConfig, config, httpHelper) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrl, config.baseUrl].join('/')
            },
            getUrl: function (path, params) {

                var url = this.getFullUrl() + '/' + path;
                var paramsString = params.join('&');

                return [url, paramsString].join('?')
            },
            getPeriodParams: function (startDate, endDate) {

                var params = [];

                if (startDate) {
                    params.push(httpHelper.prepareGetParam(config.startPeriodParamName, startDate));
                }

                if (endDate) {
                    params.push(httpHelper.prepareGetParam(config.endPeriodParamName, endDate));
                }

                return params.join('&')
            }
        }
    }])
    .factory('chart', ['$http', 'chartConfig', 'chartUtils', function ($http, config, utils) {
        return {
            getExpense: function (startDate, endDate) {
                return $http.get(utils.getUrl('expense', [utils.getPeriodParams(startDate, endDate)]));
            },
            getIncome: function (startDate, endDate) {
                return $http.get(utils.getUrl('income', [utils.getPeriodParams(startDate, endDate)]));
            }
        };
    }]);