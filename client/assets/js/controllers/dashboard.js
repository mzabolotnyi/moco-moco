App.controller('DashboardCtrl', ['$scope', 'transaction', 'transactions', 'analytics', 'notifyService',
    function ($scope, transaction, transactions, analytics, notifyService) {

        // Scope object
        $scope.scope = {
            currentSection: 'transactions',
            setCurrentSection: function (key) {
                this.currentSection = key;
            },
            checkCurrentSection: function (key) {
                return this.currentSection == key;
            },
            isSectionTransactions: function () {
                return this.checkCurrentSection('transactions');
            },
            isSectionBalance: function () {
                return this.checkCurrentSection('balance');
            },
            isSectionStats: function () {
                return this.checkCurrentSection('stats');
            },
            update: function () {
                this.transactions.update();
                this.charts.update();
                this.widget.update();
                this.mostPopularTransactions.update();
                this.categoryWatchlist.update();
                $scope.balance.update();
            },
            getExpensePerDay: function () {

                const data = this.transactions.data.reduce((acc, {currency, amount, expense}) => {
                    if (expense) acc[currency.symbol] = (acc[currency.symbol] || 0) + amount;
                    return acc;
                }, {});

                const result = Object.entries(data)
                    .map(([currency, amount]) => `${currency} ${amount.toLocaleString()}`)
                    .join(" | ");

                return result === "" ? "0" : result
            },
            getIncomePerDay: function () {

                const data = this.transactions.data.reduce((acc, {currency, amount, income}) => {
                    if (income) acc[currency.symbol] = (acc[currency.symbol] || 0) + amount;
                    return acc;
                }, {});

                const result = Object.entries(data)
                    .map(([currency, amount]) => `${currency} ${amount.toLocaleString()}`)
                    .join(" | ");

                return result === "" ? "0" : result
            },
            transactions: {
                data: transactions.data,
                currentDate: moment().toDate(),
                update: function () {

                    var _this = this;

                    _this.error = false;
                    _this.data = [];
                    _this.loading = true;

                    var filter = {
                        date: _this.currentDate
                    };

                    transaction.get(filter, 1, 0)
                        .success(function (data) {
                            _this.data = data;
                        })
                        .error(function (error) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                },
                edit: function (item) {
                    $scope.transaction.edit(item);
                },
                getAmount: function (item) {
                    var coef = item.expense ? -1 : 1;
                    return item.amount * coef;
                },
                getRecipientAmount: function (item) {
                    var coef = item.expense ? -1 : 1;
                    return item.recipientAmount * coef;
                },
                getSign: function (item) {
                    return this.getAmount(item) > 0 ? '+' : '';
                },
                getDisplayDate: function () {

                    var date = moment(this.currentDate).startOf('day');
                    var now = moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
                    var display = '';

                    var days = moment.duration(date.diff(now)).asDays();

                    if (date.year() === now.year()) {
                        display = date.format('D MMMM');
                    } else {
                        display = date.format('D MMMM YYYY');
                    }

                    return display;
                },
                moveCurrentDate: function (numberDays) {
                    this.currentDate = moment(this.currentDate).add(numberDays, 'days').toDate();
                    $scope.transaction.currentDate = this.currentDate;
                    this.update();
                },
                setCurrentDateAsToday: function () {
                    this.currentDate = moment().toDate();
                    $scope.transaction.currentDate = this.currentDate;
                    this.update();
                }
            },
            charts: {
                update: function () {
                    this.expensePie.update();
                    this.incomePie.update();
                    this.turnoverColumn.update();
                },
                expensePie: {
                    data: [],
                    month: moment().startOf('month').toDate(),
                    getDisplayMonth: function () {
                        return moment(this.month).format('MMMM YYYY');
                    },
                    moveMonth: function (numberMonths) {
                        this.month = moment(this.month).add(numberMonths, 'months').toDate();
                        this.update();
                    },
                    update: function () {

                        var _this = this;

                        _this.error = false;

                        if (!$scope.global.updateInBackground) {
                            _this.loading = true;
                            _this.data = [];
                        }

                        var startDate = moment(_this.month).startOf('month').toDate();
                        var endDate = moment(_this.month).endOf('month').toDate();

                        analytics.getExpenseByCategory(startDate, endDate)
                            .success(function (data) {
                                _this.data = angular.forEach(data, function (value, key) {
                                    value.y = value.amount;
                                });

                                if (_this.data.length === 0) {
                                    _this.data = [{name: 'Нет расходов', y: 0.001}]
                                }
                            })
                            .error(function (error) {

                                if ($scope.global.updateInBackground) {
                                    _this.data = [];
                                }

                                _this.error = true;
                                notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                            })
                            .finally(function () {
                                _this.loading = false;
                            });
                    },
                    fullScreen: false,
                    toggleFullScreen: function () {
                        this.fullScreen = !this.fullScreen;
                        this.update();
                    }
                },
                incomePie: {
                    data: [],
                    month: moment().startOf('month').toDate(),
                    getDisplayMonth: function () {
                        return moment(this.month).format('MMMM YYYY');
                    },
                    moveMonth: function (numberMonths) {
                        this.month = moment(this.month).add(numberMonths, 'months').toDate();
                        this.update();
                    },
                    update: function () {

                        var _this = this;

                        _this.error = false;

                        if (!$scope.global.updateInBackground) {
                            _this.loading = true;
                            _this.data = [];
                        }

                        var startDate = moment(_this.month).startOf('month').toDate();
                        var endDate = moment(_this.month).endOf('month').toDate();

                        analytics.getIncomeByCategory(startDate, endDate)
                            .success(function (data) {
                                _this.data = angular.forEach(data, function (value, key) {
                                    value.y = value.amount;
                                });

                                if (_this.data.length === 0) {
                                    _this.data = [{name: 'Нет доходов', y: 0.001}]
                                }
                            })
                            .error(function (error) {

                                if ($scope.global.updateInBackground) {
                                    _this.data = [];
                                }

                                _this.error = true;
                                notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                            })
                            .finally(function () {
                                _this.loading = false;
                            });
                    },
                    fullScreen: false,
                    toggleFullScreen: function () {
                        this.fullScreen = !this.fullScreen;
                        this.update();
                    }
                },
                turnoverColumn: {
                    data: [],
                    month: moment().startOf('month').toDate(),
                    category: null,
                    getDisplayPeriod: function () {
                        return moment(this.month).add(-11, 'months').format('MMMM YYYY') + ' - ' + moment(this.month).format('MMMM YYYY');
                    },
                    moveMonth: function (numberMonths) {
                        this.month = moment(this.month).add(numberMonths, 'months').toDate();
                        this.update();
                    },
                    update: function () {

                        var _this = this;

                        _this.error = false;

                        if (!$scope.global.updateInBackground) {
                            _this.loading = true;
                            _this.data = [];
                        }

                        var startDate = moment(_this.month).startOf('month').add(-11, 'months').toDate();
                        var endDate = moment(_this.month).endOf('month').toDate();

                        analytics.getTurnoverByMonth(startDate, endDate, _this.category)
                            .success(function (data) {

                                _this.data = data;

                                angular.forEach(_this.data.income, function (value, key) {
                                    value.y = value.amount;
                                });

                                angular.forEach(_this.data.expense, function (value, key) {
                                    value.y = value.amount;
                                });

                                angular.forEach(_this.data.balance, function (value, key) {
                                    value.y = value.amount;
                                });
                            })
                            .error(function (error) {

                                if ($scope.global.updateInBackground) {
                                    _this.data = [];
                                }

                                _this.error = true;
                                notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                            })
                            .finally(function () {
                                _this.loading = false;
                            });
                    },
                    fullScreen: false,
                    toggleFullScreen: function () {
                        this.fullScreen = !this.fullScreen;
                        this.update();
                    }
                }
            },
            widget: {
                update: function () {

                    var _this = this;

                    _this.error = false;

                    if (!$scope.global.updateInBackground) {
                        _this.loading = true;
                    }

                    var period = moment(_this.month).startOf('month').toDate();

                    analytics.getWidgetData(period)
                        .success(function (data) {

                            if (data.expense) {
                                _this.expense.amount = data.expense.amount;
                            }

                            if (data.income) {
                                _this.income.amount = data.income.amount;
                            }

                            if (data.profit) {
                                _this.profit.amount = data.profit.amount;
                            }
                        })
                        .error(function (error) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                },
                expense: {
                    amount: 0,
                    dynamics: 0
                },
                income: {
                    amount: 0,
                    dynamics: 0
                },
                profit: {
                    amount: 0,
                    dynamics: 0
                }
            },
            mostPopularTransactions: {
                data: [],
                update: function () {

                    var _this = this;

                    _this.error = false;

                    if (!$scope.global.updateInBackground) {
                        _this.loading = true;
                        _this.data = [];
                    }

                    analytics.getMostPopularTransactions()
                        .success(function (data) {
                            _this.data = data;
                        })
                        .error(function (error) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                }
            },
            categoryWatchlist: {
                data: [],
                month: moment().startOf('month').toDate(),
                getDisplayMonth: function () {
                    return moment(this.month).format('MMMM YYYY');
                },
                moveMonth: function (numberMonths) {
                    this.month = moment(this.month).add(numberMonths, 'months').toDate();
                    this.update();
                },
                fullScreen: false,
                toggleFullScreen: function () {
                    this.fullScreen = !this.fullScreen;
                    this.update();
                },
                update: function () {

                    var _this = this;

                    _this.error = false;

                    if (!$scope.global.updateInBackground) {
                        _this.loading = true;
                        _this.data = [];
                    }

                    var startDate = moment(_this.month).startOf('month').toDate();
                    var endDate = moment(_this.month).endOf('month').toDate();

                    analytics.getCategoryWatchlist(startDate, endDate)
                        .success(function (data) {
                            _this.data = data;
                        })
                        .error(function (error) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                }
            }
        };

        //установим коллбэк после записи операции
        $scope.transaction.callback = function () {

            if (this.date) {
                $scope.scope.transactions.currentDate = this.date;
                $scope.transaction.currentDate = this.date;
            }

            $scope.scope.transactions.update();
            $scope.scope.charts.update();
            $scope.scope.widget.update();
            $scope.scope.mostPopularTransactions.update();
            $scope.scope.categoryWatchlist.update();
        };

        //установим коллбэк после корректировки баланса
        $scope.balance.adjustment.callback = function () {

            $scope.scope.charts.update();
            $scope.scope.widget.update();
            $scope.scope.categoryWatchlist.update();

            if ($scope.scope.transactions.currentDate.toDateString() === (new Date).toDateString()) {
                $scope.scope.transactions.update();
            }
        };

        //инициализируем обновление графиков
        $scope.scope.charts.update();

        //инициализируем обновление виджетов
        $scope.scope.widget.update();

        //инициализируем обновление блока популярных транзакций
        $scope.scope.mostPopularTransactions.update();

        //инициализируем обновление watchlist
        $scope.scope.categoryWatchlist.update();

        //загрузим необходимые для фильтров данные
        $scope.global.loadData();
    }]);
