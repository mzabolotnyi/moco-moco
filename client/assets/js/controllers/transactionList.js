App.controller('TransactionsListCtrl', ['$scope', 'transaction', 'transactions', 'notifyService',
        function ($scope, transaction, transactions, notifyService) {

            // Scope object
            $scope.scope = {
                data: transactions.data,
                nextPage: 2,
                pageCount: transactions.headers('X-Pagination-Page-Count'),
                totalCount: transactions.headers('X-Pagination-Total-Count'),
                isEndOfPagination: function () {
                    return this.nextPage > this.pageCount;
                },
                update: function (reset) {

                    var _this = this;

                    _this.loading = true;
                    _this.error = false;

                    if (reset) {
                        _this.nextPage = 1;
                        _this.data = [];
                    }

                    transaction.get(_this.filter.items, _this.nextPage)
                        .success(function (data, status, headers) {

                            Array.prototype.push.apply(_this.data, data);

                            _this.nextPage++;
                            _this.pageCount = headers('X-Pagination-Page-Count');
                            _this.totalCount = headers('X-Pagination-Total-Count');
                        })
                        .error(function (error) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                },
                toggleSelected: function (item, event) {
                    item.selected = !item.selected;

                    if (event) {
                        event.stopPropagation();
                    }
                },
                hasSelected: function () {
                    return this.getCountSelected() > 0;
                },
                getCountSelected: function () {

                    var selectedItems = this.data.filter(function (obj) {
                        return obj.selected;
                    });

                    return selectedItems.length;
                },
                deselectAll: function () {
                    angular.forEach(this.data, function (obj) {
                        obj.selected = false;
                    })
                },
                deleteSelected: function () {

                    var _this = this;
                    var selectedItems = this.data.filter(function (obj) {
                        return obj.selected;
                    });

                    var countSelected = _this.getCountSelected();

                    notifyService.confirmDelete("Удалить операции (" + countSelected + ")?", function () {

                        notifyService.showLoadBar();

                        var promises = [];

                        angular.forEach(selectedItems, function (obj, index, array) {

                            var promise = _this.deleteItem(obj);
                            promise.error(function (error) {
                                notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                            });

                            promises.push(promise);
                        });

                        Promise.all(promises)
                            .finally(function () {
                                _this.update(true);
                                notifyService.hideLoadBar();
                                notifyService.notify("Операции удалены");
                                $scope.balance.update();
                            });

                    }, false);
                },
                deleteItem: function (item, callback) {
                    return transaction.delete(item);
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
                getDisplayDate: function (item) {

                    var date = moment(item.date);
                    var now = moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
                    var display = '';

                    var days = moment.duration(date.diff(now)).asDays();

                    if (days === 0) {
                        display = 'сегодня';
                    } else if (days === -1) {
                        display = 'вчера';
                    } else if (date.year() === now.year()) {
                        display = date.format('D MMM');
                    } else {
                        display = date.format('D MMM YYYY');
                    }

                    return display;
                },
                getCountInfo: function () {
                    return [this.data.length, this.totalCount].join('/');
                },
                filter: {
                    items: {
                        types: {
                            expense: true,
                            income: true,
                            transfer: true
                        }
                    },
                    opened: false,
                    open: function () {

                        var _this = this;

                        //данные для установки фильтров еще не подгружены - выполним загрузку
                        if (!$scope.global.dataLoaded) {

                            notifyService.showLoadBar();
                            $scope.global.loadData(function () {
                                _this.open();
                            });

                            return;
                        }

                        _this.opened = true;
                    },
                    close: function () {
                        this.opened = false;
                    },
                    toggle: function () {
                        if (this.opened) {
                            this.close();
                        } else {
                            this.open();
                        }
                    },
                    clear: function () {

                        this.items = {};

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    clearCategory: function () {

                        this.items.category = undefined;

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    clearAccount: function () {

                        this.items.account = undefined;

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    clearCurrency: function () {

                        this.items.currency = undefined;

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    clearComment: function () {

                        this.items.comment = '';

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    clearStartDate: function () {

                        this.items.startDate = undefined;

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    clearEndDate: function () {

                        this.items.endDate = undefined;

                        if (!$scope.global.isMobile()) {
                            this.submit();
                        }
                    },
                    submit: function () {

                        if ($scope.global.isMobile()) {
                            this.close();
                        }

                        $scope.scope.update(true);
                    }
                }
            };

            //установим коллбэк после записи операции
            $scope.transaction.callback = function () {
                $scope.scope.update(true);
            };

            //установим коллбэк после корректировки баланса
            $scope.balance.adjustment.callback = function () {
                $scope.scope.update(true);
            };

            //данные для установки фильтров еще не подгружены - выполним загрузку (только для десктопов)
            if (!$scope.global.isMobile() && !$scope.global.dataLoaded) {
                $scope.global.loadData();
            }
        }]);
