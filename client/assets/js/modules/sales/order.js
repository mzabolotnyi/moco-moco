// Create new angular module
var OrderModule = angular.module('salesOrder', []);

// Defining logic
OrderModule
    .constant('orderConfig', {
        baseUrl: 'orders'
    })
    .factory('orderUtils', ['config', 'orderConfig', 'httpHelper', function (appConfig, config, httpHelper) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrlSales, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.baseUrl, id].join('/')
            },
            prepareBodyParams: function (order) {

                return {
                    // date: moment(order.date).format('YYYY-MM-DD'),
                    // amount: order.amount,
                };
            }
        }
    }])
    .factory('order', ['$http', 'orderConfig', 'orderUtils', function ($http, config, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (order) {
                if (order.id === 0) {
                    return this.create(order);
                } else {
                    return this.update(order);
                }
            },
            create: function (order) {
                return $http.post(utils.getFullUrl(order), utils.prepareBodyParams(order));
            },
            update: function (order) {
                return $http.put(utils.getOneUrl(order.id), utils.prepareBodyParams(order));
            },
            delete: function (order) {
                return $http.delete(utils.getOneUrl(order.id));
            }
        };
    }]);