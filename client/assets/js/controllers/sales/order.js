App.controller('OrdersCtrl', ['$scope', 'order', 'orders', 'statuses', 'notifyService',
    function ($scope, orderProvider, orders, statuses, notifyService) {

        // Scope object
        $scope.scope = {
            data: orders.data,
            statuses: statuses.data,
            update: function (reset) {

                var _this = this;

                _this.loading = true;
                _this.error = false;

                if (reset) {
                    _this.data = [];
                    _this.endOfTable = false;
                }

                _this.order.editing = false;

                orderProvider.get(_this.filter.items, _this.data.length)
                    .success(function (response) {

                        if (response.length < 20){
                            _this.endOfTable = true;
                        }

                        Array.prototype.push.apply(_this.data, response);
                    })
                    .error(function (error) {
                        _this.error = true;
                        notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                    })
                    .finally(function () {
                        _this.loading = false;
                    });
            },
            onSearchChange: function () {
                // когда 2 и более символов - приминяем фильтр, когда 0 - тоже применяем для сброса, когда 1 - не обрабатываем
                if (this.filter.items.q.length !== 1) {
                    this.update(true);
                }
            },
            //инициализирует изменение объекта или создание нового
            edit: function (order) {
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
            cancelEditing: function () {
                this.order.editing = false;
                this.order.errors = {};
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
                var selectedItems = this.data.filter(function (order) {
                    return order.selected;
                });

                var countSelected = _this.getCountSelected();

                notifyService.confirmDelete("Удалить заказы (" + countSelected + ")?", function () {

                    notifyService.showLoadBar();

                    var failures = 0;

                    angular.forEach(selectedItems, function (order, index, array) {

                        var lastIteration = (index === array.length - 1);

                        orderProvider.delete(order)
                            .error(function () {
                                failures++;
                            })
                            .finally(function () {
                                if (lastIteration) {

                                    _this.update(true);

                                    notifyService.hideLoadBar();

                                    if (failures === 0) {
                                        notifyService.notify("Заказы удалены");
                                    } else {
                                        notifyService.notifyError("Не удалось удалить " + countSelected + " заказов");
                                    }
                                }
                            });
                    });
                }, false);
            },
            delete: function (order) {
                notifyService.confirmDelete("Удалить заказ #" + order.number + "?", function () {

                    notifyService.showLoadBar();

                    orderProvider.delete(order)
                        .then(function () {
                            notifyService.notify("Заказ #" + order.number + " удален");
                            $scope.scope.update(true);
                        }, function (error) {
                            notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                        })
                        .finally(function () {
                            notifyService.hideLoadBar();
                        });
                }, false);
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
            getDaysPassed: function (order) {

                var date = moment(order.date);
                var now = moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
                var display = '';

                var daysPassed = moment.duration(now.diff(date)).asDays();

                return daysPassed > 0 ? daysPassed : '-';
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
                orderProvider.updateStatus(order, status)
                    .then(function () {
                        notifyService.notify('Статус изменен');
                        order.status = status;
                    }, function (error) {
                        notifyService.notifyError('Не удалось изменить статус');
                    });
            },
            setStatusForSelected: function (status) {

                var _this = this;
                var selectedItems = this.data.filter(function (order) {
                    return order.selected;
                });

                angular.forEach(selectedItems, function (order) {
                    if (order.status.id !== status.id) {
                        _this.setStatus(order, status);
                    }
                })
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
                isModified: function () {

                    if (this.isNew()){
                        return true;
                    }

                    a =1;

                    return false;
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

                    //заполним свойства примитивных типов
                    angular.forEach(order, function (value, key) {
                        this[key] = value;
                    }, this);

                    //заполним свойства-объекты
                    this.date = moment(order.date).toDate();

                },
                //отправляет запрос на сохранение объекта
                save: function () {

                    var _this = this;

                    _this.submitting = true;
                    _this.errors = [];

                    if (!_this.validate()) {
                        if (_this.errors.length === 0) {
                            _this.errors.push({'message': 'При проверке данных были обнаружены ошибки'});
                        }
                        _this.submitting = false;
                        return;
                    }

                    notifyService.showLoadBar();

                    orderProvider.save(_this)
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
                    $scope.scope.delete(this);
                }
            },
            filter: {
                items: {
                    status: 'actual'
                },
                opened: false
            }
        };
    }]);
