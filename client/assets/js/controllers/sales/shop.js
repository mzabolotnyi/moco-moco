App.controller('ShopsCtrl', ['$scope', 'shop', 'shops', 'notifyService',
    function ($scope, shop, shops, notifyService) {

        // Scope object
        $scope.scope = {
            data: shops.data,
            update: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                _this.shop.editing = false;

                shop.get()
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
            isActive: function (shop) {
                return shop.id == this.shop.id;
            },
            //инициализирует изменение объекта или создание нового
            edit: function (shop) {

                this.shop.editing = true;
                this.shop.errors = {};

                if (typeof(shop) === 'object') {
                    this.shop.fillByObject(shop);
                    this.selected = shop;
                } else {
                    this.shop.fillDefault();
                    this.selected = undefined;
                }
            },
            cancelEditing: function () {

                this.shop.editing = false;

                if (this.selected) {
                    this.shop.fillByObject(this.selected);
                } else {
                    this.shop.fillDefault();
                }
            },
            shop: {
                //проверяет является ли объект новым или же это редактирование существующего
                isNew: function () {
                    return this.id === 0;
                },
                hasUrl: function () {
                    return this.url;
                },
                validate: function () {

                    var success = true;

                    if (this.name == '') {
                        this.errors.push({'message': 'Необходимо указать название бренда'});
                        success = false;
                    }

                    return success;
                },
                //заполнение полей по умолчанию (для новых)
                fillDefault: function () {
                    this.id = 0;
                    this.name = "";
                    this.url = "";
                },
                //заполнение полей по переданному объекту
                fillByObject: function (shop) {
                    this.id = shop.id;
                    this.name = shop.name;
                    this.url = shop.url;
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

                    shop.save(_this)
                        .then(function () {
                            notifyService.notify('Бренд сохранен');
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

                    notifyService.confirmDelete("Удалить бренд " + _this.name + "?", function () {

                        notifyService.showLoadBar();

                        shop.delete(_this)
                            .then(function () {
                                notifyService.notify("Бренд " + _this.name + " удалена");
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
