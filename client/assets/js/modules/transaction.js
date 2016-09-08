// Create new angular module
var TransactionModule = angular.module('mocoTransaction', []);

// Defining logic
CategoryModule
    .constant('transactionConfig', {
        baseUrl: 'transactions'
    })
    .factory('transactionUtils', ['config', 'transactionConfig', 'httpHelper', function (appConfig, config, httpHelper) {
        return {
            getFullUrl: function () {
                return [appConfig.apiUrl, config.baseUrl].join('/')
            },
            getIndexUrl: function (filters, page) {

                var fullUrl = this.getFullUrl();
                var getParams = [];

                getParams.push(this.getSortingParam());

                if (page) {
                    getParams.push(httpHelper.prepareGetParam('page', page));
                }

                if (filters.category) {
                    getParams.push(httpHelper.prepareGetParam('category_id', filters.category.id));
                }

                if (filters.account) {
                    getParams.push(httpHelper.prepareGetParam('account_id', filters.account.id));
                }

                if (filters.period) {
                    getParams.push(httpHelper.prepareGetParam('date', filters.period.start, 'range', filters.period.end));
                }

                if (filters.comment && filters.comment != '') {
                    getParams.push(httpHelper.prepareGetParam('comment', filters.comment, 'like'));
                }

                var getParamStr = getParams.join('&');

                return [fullUrl, getParamStr].join('?')
            },
            getCreateUrl: function (transaction) {

                var fullUrl = this.getFullUrl();
                var getParam = 'type='.concat(this.getTypeParam(transaction));

                return [fullUrl, getParam].join('?')
            },
            getOneUrl: function (id) {
                return [appConfig.apiUrl, config.baseUrl, id].join('/')
            },
            getTypeParam: function (transaction) {
                if (transaction.income) {
                    return 'income';
                } else if (transaction.transfer) {
                    return 'transfer';
                } else {
                    return 'expense';
                }
            },
            getSortingParam: function () {
                return 'sort=date DESC, id DESC';
            },
            prepareBodyParams: function (transaction) {

                var bodyParams = {
                    date: moment(transaction.date).format('YYYY-MM-DD'),
                    amount: transaction.amount,
                    account_id: transaction.account ? transaction.account.id : '',
                    category_id: transaction.category ? transaction.category.id : '',
                    currency_id: transaction.currency ? transaction.currency.id : '',
                    recipient_amount: transaction.recipientAmount,
                    recipient_account_id: transaction.recipientAccount ? transaction.recipientAccount.id : '',
                    recipient_currency_id: transaction.recipientCurrency ? transaction.recipientCurrency.id : '',
                    comment: transaction.comment
                };

                return bodyParams
            }
        }
    }])
    .factory('transaction', ['$http', 'transactionConfig', 'transactionUtils', function ($http, config, utils) {
        return {
            get: function (filters, page) {
                return $http.get(utils.getIndexUrl(filters ? filters : {}, page));
            },
            getOne: function (id) {
                return $http.get(utils.getOneUrl(id));
            },
            save: function (transaction) {
                if (transaction.id === 0) {
                    return this.create(transaction);
                } else {
                    return this.update(transaction);
                }
            },
            create: function (transaction) {
                return $http.post(utils.getCreateUrl(transaction), utils.prepareBodyParams(transaction));
            },
            update: function (transaction) {
                return $http.put(utils.getOneUrl(transaction.id), utils.prepareBodyParams(transaction));
            },
            delete: function (transaction) {
                return $http.delete(utils.getOneUrl(transaction.id));
            }
        };
    }]);