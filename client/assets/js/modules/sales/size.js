// Create new angular module
var SizeModule = angular.module('salesSize', []);

// Defining logic
SizeModule
    .constant('sizeConfig', {
        baseUrl: 'sizecategories',
    })
    .factory('sizeUtils', ['config', 'sizeConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrlSales, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.baseUrl, id].join('/')
            },
            prepareBodyParams: function (category) {

                var sizes = [];

                angular.forEach(category.sizes, function(size) {
                    this.push({
                        name: size.name
                    });
                }, sizes);

                return {
                    name: category.name,
                    sizes: sizes
                };
            }
        }
    }])
    .factory('sizeCategory', ['$http', 'sizeUtils', function ($http, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (category) {
                if (category.id === 0) {
                    return this.create(category);
                } else {
                    return this.update(category);
                }
            },
            create: function (category) {
                return $http.post(utils.getFullUrl(category), utils.prepareBodyParams(category));
            },
            update: function (category) {
                return $http.put(utils.getOneUrl(category.id), utils.prepareBodyParams(category));
            },
            delete: function (category) {
                return $http.delete(utils.getOneUrl(category.id));
            }
        };
    }]);