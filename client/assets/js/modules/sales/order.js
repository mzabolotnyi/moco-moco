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
            getIndexUrl: function (filters, page, perPage) {

                var fullUrl = this.getFullUrl();
                var getParams = [];

                getParams.push(this.getSortingParam());

                var getParamStr = getParams.join('&');

                return [fullUrl, getParamStr].join('?')
            },
            getOneUrl: function (order) {
                return [appConfig.apiUrlSales, config.baseUrl, order.id].join('/')
            },
            getSortingParam: function () {
                return 'order_by[date]=DESC&order_by[id]=DESC';
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
            get: function (filters) {
                return $http.get(utils.getIndexUrl(filters ? filters : {}));
            },
            getOne: function (order) {
                return $http.get(utils.getOneUrl(order));
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
                return $http.put(utils.getOneUrl(order), utils.prepareBodyParams(order));
            },
            delete: function (order) {
                return $http.delete(utils.getOneUrl(order));
            },
            updateStatus: function (order, status) {
                return $http.put(utils.getOneUrl(order), {'status': status.id});
            }
        };
    }]);