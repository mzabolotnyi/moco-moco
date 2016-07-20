App
    // App Controller
    .controller('AppCtrl', ['$scope', 'balance', 'profile', 'notifyService',
        function ($scope, balance, profile, notifyService) {

            // Global values
            $scope.global = {
                isMobile: function () {
                    return $('html').hasClass('ismobile');
                },
                errorMessages: {
                    get: 'Ошибка при получении данных',
                    post: 'Ошибка при отправке данных'
                }
            };

            // Sidebar
            $scope.sidebar = {
                opened: false,
                _canSwipe: true,
                canSwipe: function () {
                    return this._canSwipe;
                },
                toggle: function () {
                    this.opened = !this.opened;
                },
                open: function () {
                    this.opened = true;
                },
                close: function () {
                    this.opened = false;
                },
                showOverlayOnOpened: function () {
                    return this.opened && $scope.global.isMobile();
                },
                profileMenu: {
                    opened: false,
                    toggle: function () {
                        this.opened = !this.opened;
                    }
                }
            };

            // Header menu
            $scope.headerMenu = {
                searchPanel: {
                    opened: false,
                    open: function () {
                        this.opened = true;
                        $('#top-search-wrap').find('input').focus();
                    },
                    close: function () {
                        this.opened = false;
                    }
                }
            };

            // Circular menu
            $scope.circularMenu = {
                opened: false,
                toggle: function () {
                    if (this.opened) {
                        this.close();
                    } else {
                        this.open();
                    }
                },
                open: function () {
                    $scope.sidebar._canSwipe = false;
                    this.opened = true;
                },
                close: function () {
                    $scope.sidebar._canSwipe = true;
                    this.opened = false;
                }
            };

            // Profile
            $scope.profile = {
                data: {},
                update: function () {

                    var _this = this;
                    _this.error = false;

                    profile.get()
                        .success(function (response) {
                            _this.data = response;
                        })
                        .error(function (response) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.get);
                        });
                }
            };

            // Balance
            $scope.balance = {
                data: [],
                amount: 0,
                amountInMainCurrency: 0,
                update: function () {

                    var _this = this;
                    _this.loading = true;
                    _this.error = false;
                    _this.data = [];

                    balance.get()
                        .success(function (response) {

                            _this.data = response;

                            _this.amount = 0;
                            _this.amountInMainCurrency = 0;

                            angular.forEach(_this.data, function (value, key) {
                                _this.amount += value.amount;
                                _this.amountInMainCurrency += value.amountInMainCurrency;
                            });
                        })
                        .error(function (response) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.get);
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                },
                adjustment: {
                    account: {},
                    currency: {},
                    oldBalance: 0,
                    newBalance: 0,
                    calledFromMenu: false,
                    open: function (account, currency, currentBalance, calledFromMenu) {
                        $scope.balance.adjusted = true;
                        $scope.sidebar.opened = false;
                        $scope.sidebar._canSwipe = false;
                        this.account = account;
                        this.currency = currency;
                        this.oldBalance = currentBalance;
                        this.newBalance = currentBalance;
                        this.calledFromMenu = calledFromMenu;
                    },
                    close: function () {
                        $scope.balance.adjusted = false;
                        $scope.sidebar._canSwipe = true;
                        if (this.calledFromMenu) {
                            $scope.sidebar.opened = true;
                            this.calledFromMenu = false;
                        }
                    },
                    submit: function () {

                        var _this = this;
                        var accountId = _this.account.id;
                        var currencyId = _this.currency.id;
                        var oldBalance = parseFloat(_this.oldBalance);
                        var newBalance = parseFloat(_this.newBalance);

                        if (oldBalance == newBalance) {
                            _this.close();
                            return;
                        }

                        _this.submitting = true;
                        _this.errors = {};

                        balance.adjust(accountId, currencyId, newBalance)
                            .then(function () {
                                _this.close();
                                notifyService.notify('Баланс изменен');
                                $scope.balance.update();
                            }, function (response) {
                                if (response.data) {
                                    if (response.status === 422) {
                                        _this.errors = response.data;
                                    } else {
                                        _this.errors = [response.data];
                                        notifyService.notifyError($scope.global.errorMessages.post);
                                    }
                                }
                            })
                            .finally(function () {
                                _this.submitting = false;
                            });
                    }
                }
            };


            // Init controller
            function init() {
                $scope.profile.update();
                $scope.balance.update();
            }

            init();
        }
    ])

    // Dashboard Content Controller
    .controller('DashboardCtrl', ['$scope', function ($scope) {
    }])
    .controller('TransactionsCtrl', ['$scope', function ($scope) {

    }])
    .controller('TemplatesCtrl', ['$scope', function ($scope) {

    }])
    .controller('AccountsCtrl', ['$scope', function ($scope) {

    }])
    .controller('TagsCtrl', ['$scope', function ($scope) {

    }])
    .controller('CurrenciesCtrl', ['$scope', '$state', 'currency', 'notifyService',
        function ($scope, $state, currency, notifyService) {

            // Scope object
            $scope.scope = {
                data: [],
                menu: {
                    opened: false,
                    toggle: function () {
                        this.opened = !this.opened;
                    },
                    open: function () {
                        this.opened = true;
                    },
                    close: function () {
                        this.opened = false;
                    }
                },
                getId: function () {
                    if ($state.params.id) {
                        return parseInt($state.params.id);
                    } else {
                        return 0;
                    }
                },
                init: function () {
                    this.update();
                },
                update: function () {

                    var _this = this;

                    _this.loading = true;
                    _this.error = false;
                    _this.data = [];

                    currency.get()
                        .success(function (response) {
                            _this.data = response;
                        })
                        .error(function (response) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.get);
                        })
                        .finally(function () {
                            _this.loading = false;
                            _this.currency.update(_this.getId());
                        });
                },
                currency: {
                    id: 0,
                    name: "",
                    iso: "",
                    symbol: "",
                    default: false,
                    isNew: function () {
                        return this.id === 0;
                    },
                    //обновляет атрибуты объект согласно переданному параметру
                    update: function (currency) {

                        if (typeof(currency) === 'object') {
                            this.fillByCurrency(currency);
                        } else if (currency > 0) {
                            this.fillById(currency);
                        } else {
                            this.fillDefault();
                        }
                    },
                    //заполнение полей по умолчанию (для новых)
                    fillDefault: function () {
                        this.id = 0;
                        this.name = "";
                        this.iso = "";
                        this.symbol = "";
                        this.default = false;
                    },
                    //заполнение полей по переданному объекту
                    fillByCurrency: function (currency) {
                        this.id = currency.id;
                        this.name = currency.name;
                        this.iso = currency.iso;
                        this.symbol = currency.symbol;
                        this.default = (currency.userId == null);
                    },
                    //поиск объекта по id и заполнения по нему
                    fillById: function (id) {

                        var result = $scope.scope.data.filter(function (obj) {
                            return obj.id === id;
                        });

                        if (result.length > 0) {
                            this.fillByCurrency(result[0]);
                        } else {
                            this.fillDefault();
                        }
                    },
                    //отправляет запрос на сохранение объекта на сервер
                    save: function () {

                        var _this = this;

                        _this.submitting = true;
                        _this.errors = {};

                        currency.save(this)
                            .then(function () {
                                notifyService.notify('Валюта сохранена');
                                _this.fillDefault();
                                $scope.scope.update();
                                $scope.scope.redirectToDefaultState();
                            }, function (response) {
                                if (response.data) {
                                    if (response.status === 422) {
                                        _this.errors = response.data;
                                    } else {
                                        _this.errors = [response.data];
                                        notifyService.notifyError(global.errorMessages.post);
                                    }
                                }
                            })
                            .finally(function () {
                                _this.submitting = false;
                            });
                    },
                    delete: function () {

                        var _this = this;

                        _this.submitting = true;
                        _this.errors = {};

                        var result = confirm("Удалить валюту " + _this.name + "?");

                        if (!result) {
                            return;
                        }

                        currency.delete(this)
                            .then(function () {
                                notifyService.notify('Валюта удалена');
                                _this.fillDefault();
                                $scope.scope.update();
                            }, function (response) {
                                if (response.data) {
                                    _this.errors = [response.data];
                                    notifyService.notifyError(global.errorMessages.post);
                                }
                            })
                            .finally(function () {
                                _this.submitting = false;
                            });
                    }
                }
            };

            $scope.scope.init();
        }])
    .controller('SettingsCtrl', ['$scope', 'notifyService', function ($scope, notifyService) {

        $scope.sections = {
            interface: {
                edit: false,
                data: [
                    {
                        name: 'Отображать панель виджетов',
                        //value: $scope.profile.displayWidgets
                    },
                    {
                        name: 'Отображать блок баланса',
                        //value: $scope.profile.displayBalance
                    },
                    {
                        name: 'Отображать блок графика',
                        //value: $scope.profile.displayChart
                    },
                    {
                        name: 'Отображать блок операций',
                        //value: $scope.profile.displayTransactions
                    }
                ]
            }
        };

        $scope.saveSettings = function (section) {
            notifyService.notify('Данные сохранены', 'error');
        }
    }]);
