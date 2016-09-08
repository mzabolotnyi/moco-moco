// Create new angular module
var ProfileModule = angular.module('mocoProfile', []);

// Defining logic
ProfileModule
    .constant('profileConfig', {
        baseUrl: 'profile'
    })
    .factory('profileUtils', ['config', 'profileConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrl, config.baseUrl].join('/')
            },
            prepareBodyParams: function (profile) {

                var bodyParams = {
                    currency_id: profile.currency.id
                };

                return bodyParams
            }
        }
    }])
    .factory('profile', ['$http', 'profileConfig', 'profileUtils', function ($http, config, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            save: function (profile) {
                return $http.put(utils.getFullUrl(), utils.prepareBodyParams(profile));
            },
            updateMainCurrency: function (id) {
                return $http.put(utils.getFullUrl(), {
                    currency_id: id
                });
            }
        };
    }]);