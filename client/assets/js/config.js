App
// Router configuration
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'assets/views/pages/dashboard.html',
                controller: 'DashboardCtrl',
                pageTitle: 'Панель управления',
                viewLoader: true,
                resolve: {
                    transactions: function (transaction) {
                        return transaction.get({
                            date: moment().toDate()
                        }, 1, 0);
                    }
                }
            })
            .state('transactions', {
                url: '/transactions',
                templateUrl: 'assets/views/pages/common.html',
                abstract: true
            })
            .state('transactions.list', {
                url: '',
                templateUrl: 'assets/views/pages/transaction.html',
                controller: 'TransactionsListCtrl',
                pageTitle: 'Операции',
                viewLoader: true,
                resolve: {
                    transactions: function (transaction) {
                        return transaction.get();
                    }
                }
            })
            .state('transactions.templates', {
                url: '/templates',
                templateUrl: 'assets/views/pages/in-developing.html',
                controller: 'TemplatesCtrl',
                pageTitle: 'Шаблоны',
                viewLoader: true
            })
            .state('accounts', {
                url: '/accounts',
                templateUrl: 'assets/views/pages/accounts.html',
                controller: 'AccountsCtrl',
                pageTitle: 'Счета',
                viewLoader: true,
                resolve: {
                    accounts: function (account) {
                        return account.get();
                    },
                    currencies: function (currency) {
                        return currency.get();
                    }
                }
            })
            .state('categories', {
                url: '/categories',
                templateUrl: 'assets/views/pages/categories.html',
                controller: 'CategoriesCtrl',
                pageTitle: 'Категории',
                viewLoader: true,
                resolve: {
                    categories: function (category) {
                        return category.get();
                    }
                }
            })
            .state('currencies', {
                url: '/currencies',
                templateUrl: 'assets/views/pages/currencies.html',
                controller: 'CurrenciesCtrl',
                viewLoader: true,
                resolve: {
                    currencies: function (currency) {
                        return currency.get();
                    }
                }
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'assets/views/pages/settings.html',
                controller: 'SettingsCtrl',
                pageTitle: 'Настройки',
                viewLoad: true
            })
            .state('sales', {
                url: '/sales',
                templateUrl: 'assets/views/pages/common.html',
                abstract: true
            })
            .state('sales.orders', {
                url: '/orders',
                templateUrl: 'assets/views/pages/sales/orders.html',
                controller: 'OrdersCtrl',
                pageTitle: 'Продажи - Заказы',
                viewLoad: true,
                resolve: {
                    orders: function (order) {
                        return order.get({
                            status: 'actual',
                            limit: 20
                        });
                    },
                    statuses: function (orderStatus) {
                        return orderStatus.get();
                    },
                    sources: function (source) {
                        return source.get();
                    }
                }
            })
            .state('sales.sizes', {
                url: '/sizes',
                templateUrl: 'assets/views/pages/sales/sizes.html',
                controller: 'SizesCtrl',
                pageTitle: ' Продажи - Размеры',
                viewLoad: true,
                resolve: {
                    categories: function (sizeCategory) {
                        return sizeCategory.get();
                    }
                }
            })
            .state('sales.shops', {
                url: '/shops',
                templateUrl: 'assets/views/pages/sales/shops.html',
                controller: 'ShopsCtrl',
                pageTitle: ' Продажи - Магазины',
                viewLoad: true,
                resolve: {
                    shops: function (shop) {
                        return shop.get();
                    }
                }
            })
            .state('sales.sources', {
                url: '/sources',
                templateUrl: 'assets/views/pages/sales/sources.html',
                controller: 'SourcesCtrl',
                pageTitle: ' Продажи - Источники',
                viewLoad: true,
                resolve: {
                    sources: function (source) {
                        return source.get();
                    }
                }
            })
            .state('sales.statuses', {
                url: '/statuses',
                templateUrl: 'assets/views/pages/sales/statuses.html',
                controller: 'OrderStatusesCtrl',
                pageTitle: ' Продажи - Статусы заказов',
                viewLoad: true,
                resolve: {
                    orderStatuses: function (orderStatus) {
                        return orderStatus.get();
                    }
                }
            })
    })

    // httpProvider configuration
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                // request: function (config) {
                //     config.timeout = 10000;
                //     return config;
                // },
                responseError: function (rejection) {
                    return $q.reject(rejection);
                }
            };
        });
    }])

    // Run our App
    .run(['$rootScope', '$window', 'config', 'auth', 'cfpLoadingBar', function ($rootScope, $window, config, auth, cfpLoadingBar) {

        // Detact Mobile Browser
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $('html').addClass('ismobile');
            $rootScope.isMobile = true;
        }

        // Access config (constants) easily from all controllers
        $rootScope.config = config;

        // Check auth
        if (!auth.isAuthenticated()) {
            $window.location.href = config.authHref;
            return;
        }

        // Define logic on state changing
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            cfpLoadingBar.start();
            if (!auth.isAuthenticated()) {
                event.preventDefault();
                $window.location.href = config.authHref;
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            // add little delay
            setTimeout(function () {
                cfpLoadingBar.complete();
            }, 500);
            $rootScope.pageTitle = toState.pageTitle ? toState.pageTitle : config.appName;
        });
    }]);
