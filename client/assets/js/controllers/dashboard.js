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
                $scope.balance.update();
            },
            getExpensePerDay: function () {

                var amount = 0;

                angular.forEach(this.transactions.data, function (value, key) {
                    if (value.expense) {
                        amount += value.amount;
                    }
                });

                return amount;
            },
            getIncomePerDay: function () {

                var amount = 0;

                angular.forEach(this.transactions.data, function (value, key) {
                    if (value.income) {
                        amount += value.amount;
                    }
                });

                return amount;
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
                                _this.expense.dynamics = data.expense.dynamics;
                            }

                            if (data.income) {
                                _this.income.amount = data.income.amount;
                                _this.income.dynamics = data.income.dynamics;
                            }

                            if (data.profit) {
                                _this.profit.amount = data.profit.amount;
                                _this.profit.dynamics = data.profit.dynamics;
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
                    dynamics: 0,
                    isOk: function () {
                        return this.dynamics < 0;
                    },
                    isBad: function () {
                        return this.dynamics > 0;
                    },
                    getDisplayDynamics: function () {
                        return Math.abs(this.dynamics);
                    }
                },
                income: {
                    amount: 0,
                    dynamics: 0,
                    isOk: function () {
                        return this.dynamics > 0;
                    },
                    isBad: function () {
                        return this.dynamics < 0;
                    },
                    getDisplayDynamics: function () {
                        return Math.abs(this.dynamics);
                    }
                },
                profit: {
                    amount: 0,
                    dynamics: 0,
                    isOk: function () {
                        return this.dynamics > 0;
                    },
                    isBad: function () {
                        return this.dynamics < 0;
                    },
                    getTitle: function () {
                        return this.amount >= 0 ? 'Экономия' : 'Перерасход'
                    },
                    getDisplayDynamics: function () {
                        return Math.abs(this.dynamics);
                    }
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
        };

        //установим коллбэк после корректировки баланса
        $scope.balance.adjustment.callback = function () {

            $scope.scope.charts.update();
            $scope.scope.widget.update();

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

        //загрузим необходимые для фильтров данные
        $scope.global.loadData();
    }]);
