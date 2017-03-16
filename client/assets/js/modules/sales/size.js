// Create new angular module
var SizeModule = angular.module('salesSize', []);

// Defining logic
SizeModule
    .constant('sizeConfig', {
        baseUrl: 'sizecategories',
        sizeUrl: 'sizes'
    })
    .factory('sizeUtils', ['config', 'sizeConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrlSales, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.baseUrl, id].join('/')
            },
            getSizeFullUrl: function () {
                return [appConfig.apiUrlSales, config.sizeUrl].join('/')
            },
            getSizeOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.sizeUrl, id].join('/')
            },
            prepareBodyParams: function (object) {
                return {
                    name: object.name
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
    }])
    .factory('size', ['$http', 'sizeUtils', function ($http, utils) {
        return {
            get: function () {
                return $http.get(utils.getSizeFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getSizeOneUrl(id));
            },
            save: function (size) {
                if (size.id === 0) {
                    return this.create(size);
                } else {
                    return this.update(size);
                }
            },
            create: function (size) {
                return $http.post(utils.getSizeFullUrl(size), utils.prepareBodyParams(size));
            },
            update: function (size) {
                return $http.put(utils.getSizeOneUrl(size.id), utils.prepareBodyParams(size));
            },
            delete: function (size) {
                return $http.delete(utils.getSizeOneUrl(size.id));
            }
        };
    }]);