// Create new angular module
var SourceModule = angular.module('salesSource', []);

// Defining logic
SourceModule
    .constant('sourceConfig', {
        baseUrl: 'sources'
    })
    .factory('sourceUtils', ['config', 'sourceConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrlSales, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.baseUrl, id].join('/')
            },
            prepareBodyParams: function (source) {
                var body = {
                    name: source.name,
                    url: source.url,
                    comment: source.comment
                };

                if (source.icon && source.icon.data) {
                    body.icon = {
                        data: source.icon.data,
                        origin: source.icon.origin
                    }
                }

                return body;
            }
        }
    }])
    .factory('source', ['$http', 'sourceUtils', function ($http, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (source) {
                if (source.id === 0) {
                    return this.create(source);
                } else {
                    return this.update(source);
                }
            },
            create: function (source) {
                return $http.post(utils.getFullUrl(source), utils.prepareBodyParams(source));
            },
            update: function (source) {
                return $http.put(utils.getOneUrl(source.id), utils.prepareBodyParams(source));
            },
            delete: function (source) {
                return $http.delete(utils.getOneUrl(source.id));
            }
        };
    }]);