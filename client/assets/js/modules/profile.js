// Create new angular module
var ProfileModule = angular.module('mocoProfile', []);

// Defining logic
ProfileModule
    .constant('profileConfig', {
        baseUrl: 'profile'
    })
    .factory('profileUtils', ['config', function (appConfig) {
        return {
            getFullUrl: function (path) {
                return [appConfig.apiUrl, path].join('/')
            }
        }
    }])
    .factory('profile', ['$http', 'profileConfig', 'profileUtils', function ($http, config, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl(config.baseUrl));
            }
        };
    }]);