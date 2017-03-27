// Create new angular module
var ShopModule = angular.module('salesShop', []);

// Defining logic
ShopModule
    .constant('shopConfig', {
        baseUrl: 'shops'
    })
    .factory('shopUtils', ['config', 'shopConfig', function (appConfig, config) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrlSales, config.baseUrl].join('/')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrlSales, config.baseUrl, id].join('/')
            },
            prepareBodyParams: function (shop) {
                var body = {
                    name: shop.name,
                    url: shop.url,
                    comment: shop.comment
                };

                if (shop.sizeGuide && shop.sizeGuide.data) {
                    body.sizeGuide = {
                        data: shop.sizeGuide.data,
                        origin: shop.sizeGuide.origin
                    }
                }

                if (shop.icon && shop.icon.data) {
                    body.icon = {
                        data: shop.icon.data,
                        origin: shop.icon.origin
                    }
                }

                return body;
            }
        }
    }])
    .factory('shop', ['$http', 'shopUtils', function ($http, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (shop) {
                if (shop.id === 0) {
                    return this.create(shop);
                } else {
                    return this.update(shop);
                }
            },
            create: function (shop) {
                return $http.post(utils.getFullUrl(shop), utils.prepareBodyParams(shop));
            },
            update: function (shop) {
                return $http.put(utils.getOneUrl(shop.id), utils.prepareBodyParams(shop));
            },
            delete: function (shop) {
                return $http.delete(utils.getOneUrl(shop.id));
            }
        };
    }]);