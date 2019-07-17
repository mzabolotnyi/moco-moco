// Create new angular module
var AccountModule = angular.module('mocoAccount', []);

// Defining logic
AccountModule
    .constant('accountConfig', {
        baseUrl: 'accounts'
    })
    .factory('accountUtils', ['config', 'accountConfig', function (appConfig, config) {
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
            getCurrenciesUrl: function (id) {
                return [appConfig.apiUrl, config.baseUrl, id, 'currencies'].join('/')
            },
            prepareBodyParams: function (account) {

                return {
                    name: account.name,
                    color: account.color,
                    merchant_id: account.merchantId,
                    merchant_password: account.merchantPassword,
                    card_number: account.cardNumber.replace(/\s/g, ''),
                    import_type: account.importType ? account.importType.value : null,
                    import: account.import,
                    active: account.active
                };
            },
            prepareCurrenciesBodyParams: function (currencies) {

                var bodyParams = {currencies: {data: []}};

                angular.forEach(currencies, function (value) {
                    if (value.used) {
                        this.data.push({
                            currency_id: value.currency.id
                        });
                    }
                }, bodyParams.currencies);

                return bodyParams
            }
        }
    }])
    .factory('account', ['$http', 'accountConfig', 'accountUtils', function ($http, config, utils) {
        return {
            get: function () {
                return $http.get(utils.getFullUrl());
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (account) {
                if (account.id === 0) {
                    return this.create(account);
                } else {
                    return this.update(account);
                }
            },
            create: function (account) {
                return $http.post(utils.getFullUrl(), utils.prepareBodyParams(account));
            },
            update: function (account) {
                return $http.put(utils.getOneUrl(account.id), utils.prepareBodyParams(account));
            },
            delete: function (account) {
                return $http.delete(utils.getOneUrl(account.id));
            },
            setCurrencies: function (accountId, currencies) {
                return $http.put(utils.getCurrenciesUrl(accountId), utils.prepareCurrenciesBodyParams(currencies));
            },
            getTransactions: function (account) {
                return $http.get(utils.getTransactionsUrl(account.id));
            },
            updateTransactions: function (account, bodyParams) {
                return $http.put(utils.getTransactionsUrl(account.id), bodyParams);
            },
            moveTransactionsToAccount: function (account, newAccount) {
                return this.updateTransactions(account, {'account_id': newAccount.id});
            },
            deleteTransactions: function (account) {
                return $http.delete(utils.getTransactionsUrl(account.id));
            }
        };
    }]);