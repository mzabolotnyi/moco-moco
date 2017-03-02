App.controller('CurrenciesCtrl', ['$scope', 'currencies', 'currency', 'notifyService',
        function ($scope, currencies, currency, notifyService) {

            // Scope object
            $scope.scope = {
                data: currencies.data,
                update: function () {

                    var _this = this;

                    _this.loading = true;
                    _this.error = false;
                    _this.data = [];

                    _this.currency.editing = false;

                    currency.get()
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
                isMainCurrency: function (currency) {
                    return $scope.profile.isMainCurrency(currency);
                },
                isActive: function (currency) {
                    return currency.id == this.currency.id;
                },
                //инициализирует изменение объекта или создание нового
                edit: function (currency) {

                    this.currency.editing = true;
                    this.currency.errors = {};

                    if (typeof(currency) === 'object') {
                        this.currency.fillByObject(currency);
                        this.selected = currency;
                    } else {
                        this.currency.fillDefault();
                        this.selected = undefined;
                    }
                },
                cancelEditing: function () {

                    this.currency.editing = false;

                    if (this.selected) {
                        this.currency.fillByObject(this.selected);
                    } else {
                        this.currency.fillDefault();
                    }
                },
                currency: {
                    //курс
                    rate: {
                        rate: 0,
                        newRate: 0,
                        wasChanged: function () {
                            return rate != newRate;
                        },
                        save: function (id) {
                            return currency.setRate(id, this.newRate);
                        }
                    },
                    //проверяет является ли объект новым или же это редактирование существующего
                    isNew: function () {
                        return this.id === 0;
                    },
                    //заполнение полей по умолчанию (для новых)
                    fillDefault: function () {
                        this.id = 0;
                        this.name = "";
                        this.iso = "";
                        this.symbol = "";
                        this.default = false;
                        this.rate.rate = 0;
                        this.rate.newRate = 1;
                    },
                    //заполнение полей по переданному объекту
                    fillByObject: function (currency) {
                        angular.forEach(currency, function (value, key) {
                            if (key != 'rate') {
                                this[key] = value;
                            }
                        }, this);
                        this.default = (currency.userId == null);
                        this.rate.rate = currency.rate.rate;
                        this.rate.newRate = currency.rate.rate;
                    },
                    //отправляет запрос на сохранение объекта
                    save: function () {

                        var _this = this;

                        _this.submitting = true;
                        _this.errors = {};

                        notifyService.showLoadBar();

                        currency.save(_this)
                            .then(function (response) {
                                return _this.rate.save(response.data.id);
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
                            .then(function () {
                                notifyService.notify('Валюта сохранена');
                                $scope.scope.update();
                            })
                            .finally(function () {
                                _this.submitting = false;
                                notifyService.hideLoadBar();
                            });
                    },
                    //отправляет запрос на удаление объекта
                    delete: function () {

                        var _this = this;

                        //проверим не основная ли это валюта
                        if ($scope.scope.isMainCurrency(_this)) {
                            notifyService.alertWarning('Перед удалением необходимо назначить другую валюту основной');
                            return;
                        }

                        _this.errors = {};

                        notifyService.confirmDelete("Удалить валюту " + _this.name + "?", function () {

                            notifyService.showLoadBar();

                            currency.delete(_this)
                                .then(function () {
                                    notifyService.notify("Валюта " + _this.name + " удалена");
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
                    },
                    //устанавливает валюту в качестве основной
                    setAsMain: function () {
                        $scope.profile.updateMainCurrency(this);
                    }
                }
            };

            if (!$scope.global.isMobile()) {
                $scope.scope.edit($scope.scope.data[0]);
            }
        }]);
