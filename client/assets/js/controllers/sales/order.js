App.controller('OrdersCtrl', ['$scope', 'order', 'orders', 'statuses', 'notifyService',
    function ($scope, order, orders, statuses, notifyService) {

        // Scope object
        $scope.scope = {
            data: orders.data,
            statuses: statuses.data,
            update: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                _this.order.editing = false;

                order.get()
                    .success(function (response) {
                        _this.data = response;
                    })
                    .error(function (error) {
                        _this.error = true;
                        notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                    })
                    .finally(function () {
                        _this.loading = false;
                    });
            },
            isActive: function (order) {
                return order.id == this.order.id;
            },
            //инициализирует изменение объекта или создание нового
            edit: function (order) {
                console.log('edit order with ID ' + order.id);
                this.order.editing = true;
                this.order.errors = {};

                if (typeof(order) === 'object') {
                    this.order.fillByObject(order);
                    this.selected = order;
                } else {
                    this.order.fillDefault();
                    this.selected = undefined;
                }
            },
            delete: function (order) {

                console.log('deleted order with ID ' + order.id);
            },
            toggleSelected: function (order) {
                order.selected = !order.selected;

                if (event) {
                    event.stopPropagation();
                }
            },
            toggleSelectedAll: function (order) {

                var selected = this.hasSelected();

                angular.forEach(this.data, function (order) {
                    order.selected = !selected;
                })
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

                    var failures = 0;

                    angular.forEach(selectedItems, function (obj, index, array) {

                        var lastIteration = (index === array.length - 1);

                        _this.deleteItem(obj)
                            .error(function () {
                                failures++;
                            })
                            .finally(function () {
                                if (lastIteration) {

                                    _this.update(true);

                                    notifyService.hideLoadBar();

                                    if (failures == 0) {
                                        notifyService.notify("Операции удалены");
                                    } else {
                                        notifyService.notifyError("Не удалось удалить " + countSelected + " операции");
                                    }

                                    //обновим данные о балансе
                                    $scope.balance.update();
                                }
                            });
                    });
                }, false);
            },
            cancelEditing: function () {

                this.order.editing = false;

                if (this.selected) {
                    this.order.fillByObject(this.selected);
                } else {
                    this.order.fillDefault();
                }
            },
            getDisplayDate: function (order) {

                var date = moment(order.date);
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
            getDisplaySource: function (order) {

                if (order.source) {
                    return order.source.name;
                }

                return 'не указан';
            },
            getDisplayProduct: function (order) {

                var products = [];

                angular.forEach(order.rows, function (row) {
                    if (row.product) {
                        this.push(row.product);
                    }
                }, products);

                return products.join(', ');
            },
            getShopUrl: function (order) {

                var urls = [];

                angular.forEach(order.rows, function (row) {
                    if (row.shop && row.shop.url) {
                        this.push(row.shop.url);
                    }
                }, urls);

                return urls.length > 0 ? urls[0] : null;
            },
            getShopIcon: function (order) {

                var icons = [];

                angular.forEach(order.rows, function (row) {
                    if (row.shop && row.shop.icon) {
                        this.push(row.shop.icon.path);
                    }
                }, icons);

                return icons.length === 1 ? icons[0] : null;
            },
            getAmount: function (order) {

                var amount = 0;

                angular.forEach(order.rows, function (row) {
                    amount += row.sellingPrice;
                });

                return amount;
            },
            getProfitAmount: function (order) {

                var purchaseAmount = 0;

                angular.forEach(order.rows, function (row) {
                    purchaseAmount += row.purchasePrice;
                });

                var amount = this.getAmount(order);

                return amount - purchaseAmount;
            },
            getRowStyle: function (order) {

                var style = {};

                if (order.status.asClosed) {
                    style.color = 'rgb(185, 185, 185)';
                    style.textDecoration = 'line-through';
                } else if (!order.status.noColor) {
                    style.color = order.status.color;
                }

                return style;
            },
            setStatus: function (order, status) {
                order.status = status;
            },
            contextMenuOptions: function (order) {

                var _this = this;
                var statusSubMenu = [];

                angular.forEach(_this.statuses, function (status) {

                    var itemText = (status.icon ? '<i class="fa ' + status.icon + '"></i>&nbsp&nbsp' : '') + status.name;

                    if (order.status.id === status.id) {
                        itemText += '<i class="zmdi zmdi-check pull-right"></i>';
                    }

                    statusSubMenu.push([itemText, function () {
                        $scope.scope.setStatus(order, status);
                    }, function () {
                        return order.status.id !== status.id
                    }])
                });

                var selectOptionText = order.selected ? '<i class="fa fa-square-o"></i>&nbsp&nbspСнять отметку' : '<i class="fa fa-check-square-o"></i>&nbsp&nbspОтметить';

                var menuOptions = [
                    ['Установить статус<i>&nbsp&nbsp</i>', statusSubMenu],
                    null,
                    ['<i class="zmdi zmdi-edit"></i>&nbsp&nbspИзменить', function () {
                        _this.edit(order);
                    }],
                    ['<i class="zmdi zmdi-delete"></i>&nbsp&nbspУдалить', function () {
                        _this.delete(order);
                    }],
                    null,
                    [selectOptionText, function () {
                        _this.toggleSelected(order);
                    }]
                ];

                if (order.url || order.urlChat) {

                    menuOptions.push(null);

                    if (order.url) {
                        menuOptions.push(['<i class="zmdi zmdi-open-in-new"></i>&nbsp&nbspОткрыть на Kidstaff', function () {
                            $scope.global.goToUrl(order.url);
                        }]);
                    }

                    if (order.urlChat) {
                        menuOptions.push(['<i class="zmdi zmdi-comments"></i>&nbsp&nbspОткрыть диалог', function () {
                            $scope.global.goToUrl(order.urlChat);
                        }]);
                    }
                }

                return menuOptions;
            },
            order: {
                //проверяет является ли объект новым или же это редактирование существующего
                isNew: function () {
                    return this.id === 0;
                },
                hasUrl: function () {
                    return this.url;
                },
                validate: function () {

                    var success = true;

                    if (!this.name) {
                        this.errors.push({'message': 'Необходимо указать название бренда'});
                        success = false;
                    }

                    return success;
                },
                //заполнение полей по умолчанию (для новых)
                fillDefault: function () {
                    this.id = 0;
                    this.number = '';
                },
                //заполнение полей по переданному объекту
                fillByObject: function (order) {
                    this.id = order.id;
                    this.number = order.number;
                },
                //отправляет запрос на сохранение объекта
                save: function () {

                    var _this = this;

                    _this.submitting = true;
                    _this.errors = [];

                    if (!_this.validate()) {
                        if (_this.errors.length == 0) {
                            _this.errors.push({'message': 'При проверке данных были обнаружены ошибки'});
                        }
                        _this.submitting = false;
                        return;
                    }

                    notifyService.showLoadBar();

                    order.save(_this)
                        .then(function () {
                            notifyService.notify('Заказ сохранен');
                            $scope.scope.update();
                        }, function (error) {
                            if (error.data) {
                                if (error.status === 422) {
                                    _this.errors = error.data;
                                } else {
                                    _this.errors = [error.data];
                                    notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                                }
                            }
                        })
                        .finally(function () {
                            _this.submitting = false;
                            notifyService.hideLoadBar();
                        });
                },
                //отправляет запрос на удаление объекта
                delete: function () {

                    var _this = this;

                    _this.errors = {};

                    notifyService.confirmDelete("Удалить заказ #" + _this.number + "?", function () {

                        notifyService.showLoadBar();

                        order.delete(_this)
                            .then(function () {
                                notifyService.notify("Заказ #" + _this.number + " удален");
                                _this.fillDefault();
                                $scope.scope.update();
                            }, function (error) {
                                if (error.data) {
                                    _this.errors = [error.data];
                                    notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                                }
                            })
                            .finally(function () {
                                notifyService.hideLoadBar();
                            });
                    }, false);
                }
            }
        };
    }]);
