App.controller('OrderStatusesCtrl', ['$scope', 'orderStatus', 'orderStatuses', 'notifyService',
    function ($scope, orderStatus, orderStatuses, notifyService) {

        // Scope object
        $scope.scope = {
            data: orderStatuses.data,
            update: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                _this.orderStatus.editing = false;

                orderStatus.get()
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
            isActive: function (orderStatus) {
                return orderStatus.id == this.orderStatus.id;
            },
            //инициализирует изменение объекта или создание нового
            edit: function (orderStatus) {

                this.orderStatus.editing = true;
                this.orderStatus.errors = {};

                if (typeof(orderStatus) === 'object') {
                    this.orderStatus.fillByObject(orderStatus);
                    this.selected = orderStatus;
                } else {
                    this.orderStatus.fillDefault();
                    this.selected = undefined;
                }
            },
            cancelEditing: function () {

                this.orderStatus.editing = false;

                if (this.selected) {
                    this.orderStatus.fillByObject(this.selected);
                } else {
                    this.orderStatus.fillDefault();
                }
            },
            orderStatus: {
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
                    this.name = "";
                    this.color = null;
                    this.asClosed = false;
                },
                //заполнение полей по переданному объекту
                fillByObject: function (orderStatus) {
                    this.id = orderStatus.id;
                    this.name = orderStatus.name;
                    this.color = orderStatus.color;
                    this.asClosed = orderStatus.asClosed;
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

                    orderStatus.save(_this)
                        .then(function () {
                            notifyService.notify('Статус сохранен');
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

                    notifyService.confirmDelete("Удалить статус " + _this.name + "?", function () {

                        notifyService.showLoadBar();

                        orderStatus.delete(_this)
                            .then(function () {
                                notifyService.notify("Статус " + _this.name + " удален");
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

        if (!$scope.global.isMobile()) {
            $scope.scope.edit($scope.scope.data[0]);
        }

    }]);
