// Create new angular module
var OrderStatusModule = angular.module('salesOrderStatus', []);

// Defining logic
OrderStatusModule
    .constant('orderStatusConfig', {
        baseUrl: 'orderstatuses'
    })
    .factory('orderStatusUtils', ['config', 'orderStatusConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrlSales, config.baseUrl].join('/') + '?order_by[forNew]=DESC&order_by[createdAt]=ASC';
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.baseUrl, id].join('/')
            },
            prepareBodyParams: function (orderStatus) {
                return {
                    name: orderStatus.name,
                    color: orderStatus.color,
                    asClosed: orderStatus.asClosed,
                    forNew: orderStatus.forNew,
                    noColor: orderStatus.noColor,
                    icon: orderStatus.icon
                };
            }
        }
    }])
    .factory('orderStatus', ['$http', 'orderStatusUtils', function ($http, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (orderStatus) {
                if (orderStatus.id === 0) {
                    return this.create(orderStatus);
                } else {
                    return this.update(orderStatus);
                }
            },
            create: function (orderStatus) {
                return $http.post(utils.getFullUrl(orderStatus), utils.prepareBodyParams(orderStatus));
            },
            update: function (orderStatus) {
                return $http.put(utils.getOneUrl(orderStatus.id), utils.prepareBodyParams(orderStatus));
            },
            delete: function (orderStatus) {
                return $http.delete(utils.getOneUrl(orderStatus.id));
            }
        };
    }]);