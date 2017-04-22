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
            getIndexUrl: function (filter, offset) {

                var fullUrl = this.getFullUrl();
                var getParams = [];

                getParams.push(httpHelper.prepareGetParam('limit', 20));
                getParams.push(httpHelper.prepareGetParam('offset', offset));
                getParams.push(this.getSortingParam());

                if (filter.status) {
                    getParams.push(httpHelper.prepareGetParam('filters[status]', filter.status));
                }

                if (filter.q) {
                    getParams.push(httpHelper.prepareGetParam('filters[q]', filter.q));
                }

                var getParamStr = getParams.join('&');

                return [fullUrl, getParamStr].join('?')
            },
            getOneUrl: function (order) {
                return [appConfig.apiUrlSales, config.baseUrl, order.id].join('/')
            },
            getSortingParam: function () {
                return 'order_by[date]=DESC';
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
            get: function (filter, offset) {
                return $http.get(utils.getIndexUrl(filter ? filter : {}, offset));
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