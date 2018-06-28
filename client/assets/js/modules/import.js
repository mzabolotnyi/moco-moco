// Create new angular module
var ImportModule = angular.module('mocoImport', []);

// Defining logic
TransactionModule
    .constant('importConfig', {
        baseUrl: 'import'
    })
    .factory('importUtils', ['config', 'importConfig', 'httpHelper', function (appConfig, config, httpHelper) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrl, config.baseUrl].join('/')
            },
            getTransactionForImportUrl: function (filters) {

                var fullUrl = this.getFullUrl() + '/get-transactions-for-import';
                var getParams = [];

                if (filters.startDate) {
                    getParams.push(httpHelper.prepareGetParam('startDate', filters.startDate));
                }

                if (filters.endDate) {
                    getParams.push(httpHelper.prepareGetParam('endDate', filters.endDate));
                }

                var getParamStr = getParams.join('&');

                return [fullUrl, getParamStr].join('?')
            }
        }
    }])
    .factory('importService', ['$http', 'importConfig', 'importUtils', function ($http, config, utils) {
        return {
            getTransactionForImport: function (filters) {
                return $http.get(utils.getTransactionForImportUrl(filters ? filters : {}));
            },
        };
    }]);