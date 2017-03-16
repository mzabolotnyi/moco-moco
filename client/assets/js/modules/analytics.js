// Create new angular module
var AnalyticsModule = angular.module('mocoAnalytics', []);

// Defining logic
AnalyticsModule
    .constant('analyticsConfig', {
        baseUrl: 'analytics',
        startPeriodParamName: 'startDate',
        endPeriodParamName: 'endDate'
    })
    .factory('analyticsUtils', ['config', 'analyticsConfig', 'httpHelper', function (appConfig, config, httpHelper) {
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
    .factory('analytics', ['$http', 'analyticsConfig', 'analyticsUtils', 'httpHelper', function ($http, config, utils, httpHelper) {
        return {
            getExpenseByCategory: function (startDate, endDate) {
                return $http.get(utils.getUrl('expense', [utils.getPeriodParams(startDate, endDate)]));
            },
            getIncomeByCategory: function (startDate, endDate) {
                return $http.get(utils.getUrl('income', [utils.getPeriodParams(startDate, endDate)]));
            },
            getWidgetData: function (period) {
                return $http.get(utils.getUrl('widget-data', [httpHelper.prepareGetParam('period', period)]));
            }
        };
    }]);