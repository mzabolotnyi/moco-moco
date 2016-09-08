// Create new angular module
var CategoryModule = angular.module('mocoCategory', []);

// Defining logic
CategoryModule
    .constant('categoryConfig', {
        baseUrl: 'categories'
    })
    .factory('categoryUtils', ['config', 'categoryConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrl, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrl, config.baseUrl, id].join('/')
            },
            getTransactionsUrl: function (id) {
                return [appConfig.apiUrl, config.baseUrl, id, 'transactions'].join('/')
            },
            prepareBodyParams: function (category) {

                var bodyParams = {
                    name: category.name,
                    icon: category.icon,
                    income: category.income,
                    expense: category.expense,
                    active: category.active
                };

                return bodyParams
            }
        }
    }])
    .factory('category', ['$http', 'categoryConfig', 'categoryUtils', function ($http, config, utils) {
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
                return $http.post(utils.getFullUrl(), utils.prepareBodyParams(category));
            },
            update: function (category) {
                return $http.put(utils.getOneUrl(category.id), utils.prepareBodyParams(category));
            },
            delete: function (category) {
                return $http.delete(utils.getOneUrl(category.id));
            },
            getTransactions: function (category) {
                return $http.get(utils.getTransactionsUrl(category.id));
            },
            updateTransactions: function (category, bodyParams) {
                return $http.put(utils.getTransactionsUrl(category.id), bodyParams);
            },
            moveTransactionsToCategory: function (category, newCategory) {
                return this.updateTransactions(category, {'category_id': newCategory.id});
            },
            deleteTransactions: function (category) {
                return $http.delete(utils.getTransactionsUrl(category.id));
            }
        };
    }]);