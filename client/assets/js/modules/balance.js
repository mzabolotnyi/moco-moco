// Create new angular module
var BalanceModule = angular.module('mocoBalance', []);

// Defining logic
BalanceModule
    .constant('balanceConfig', {
        baseUrl: 'accounts/balance'
    })
    .factory('balanceUtils', ['config', function (appConfig) {
        return {
            getFullUrl: function (path) {
                return [appConfig.apiUrl, path].join('/')
            },
            getAdjustUrl: function (accountId, currencyId) {
                return [appConfig.apiUrl, 'accounts', accountId, 'balance', currencyId].join('/')
            }
        }
    }])
    .factory('balance', ['$http', 'balanceConfig', 'balanceUtils', function ($http, config, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl(config.baseUrl));
            },
            adjust: function (accountId, currencyId, amount, categoryId) {

                var bodyParams = {amount: amount};

                if (categoryId) {
                    bodyParams.category = categoryId;
                }

                return $http.post(utils.getAdjustUrl(accountId, currencyId), bodyParams);
            }
        };
    }]);