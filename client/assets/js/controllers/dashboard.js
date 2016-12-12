App
    .controller('DashboardCtrl', ['$scope', 'transaction', 'transactions', 'chart', 'notifyService',
        function ($scope, transaction, transactions, chart, notifyService) {

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
                transactions: {
                    data: transactions.data,
                    update: function () {

                        var _this = this;

                        _this.loading = true;
                        _this.error = false;
                        _this.data = [];

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
                    currentDate: moment().toDate(),
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
                        this.update();
                    },
                    setCurrentDateAsToday: function () {
                        this.currentDate = moment().toDate();
                        this.update();
                    }
                },
                charts: {
                    update: function () {
                        this.expensePie.update();
                        this.incomePie.update();
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

                            _this.loading = true;
                            _this.error = false;
                            _this.data = [];

                            var startDate = moment(_this.month).startOf('month').toDate();
                            var endDate = moment(_this.month).endOf('month').toDate();

                            chart.getExpense(startDate, endDate)
                                .success(function (data) {
                                    _this.data = angular.forEach(data, function (value, key) {
                                        value.y = value.amount;
                                    });

                                    if (_this.data.length === 0) {
                                        _this.data = [{name: 'Нет расходов', y: 0.001}]
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

                            _this.loading = true;
                            _this.error = false;
                            _this.data = [];

                            var startDate = moment(_this.month).startOf('month').toDate();
                            var endDate = moment(_this.month).endOf('month').toDate();

                            chart.getIncome(startDate, endDate)
                                .success(function (data) {
                                    _this.data = angular.forEach(data, function (value, key) {
                                        value.y = value.amount;
                                    });

                                    if (_this.data.length === 0) {
                                        _this.data = [{name: 'Нет доходов', y: 0.001}]
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
                        fullScreen: false,
                        toggleFullScreen: function () {
                            this.fullScreen = !this.fullScreen;
                            this.update();
                        }
                    }
                }
            };

            //установим коллбэк после записи операции
            $scope.transaction.callback = function () {
                $scope.scope.transactions.update();
            };

            //инициализируем обновление графиков
            $scope.scope.charts.update();
        }])
