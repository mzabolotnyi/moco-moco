// Create new angular module
var CurrencyModule = angular.module('mocoCurrency', []);

// Defining logic
CurrencyModule
    .constant('currencyConfig', {
        baseUrl: 'currencies'
    })
    .factory('currencyUtils', ['config', 'currencyConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrl, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrl, config.baseUrl, id].join('/')
            },
            prepareBodyParams: function (currency) {

                var bodyParams = {
                    name: currency.name,
                    iso: currency.iso,
                    symbol: currency.symbol
                };

                return bodyParams
            }
        }
    }])
    .factory('currency', ['$http', 'currencyConfig', 'currencyUtils', function ($http, config, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (currency) {
                if (currency.id === 0) {
                    return this.create(currency);
                } else {
                    return this.update(currency);
                }
            },
            create: function (currency) {
                return $http.post(utils.getFullUrl(), utils.prepareBodyParams(currency));
            },
            update: function (currency) {
                return $http.put(utils.getOneUrl(currency.id), utils.prepareBodyParams(currency));
            },
            delete: function (currency) {
                return $http.delete(utils.getOneUrl(currency.id));
            }
        };
    }]);