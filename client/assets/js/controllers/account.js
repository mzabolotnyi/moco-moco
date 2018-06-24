App.controller('AccountsCtrl', ['$scope', 'currencies', 'accounts', 'account', 'notifyService',
    function ($scope, currencies, accounts, account, notifyService) {

        // Scope object
        $scope.scope = {
            data: [],
            update: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                _this.account.editing = false;

                account.get()
                    .success(function (data) {

                        _this.data = $scope.global.sortDataByField(data, 'countTrans');

                        // обновим глобальный массив счетов
                        $scope.global.accounts = _this.data;
                    })
                    .error(function (error) {
                        _this.error = true;
                        notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                    })
                    .finally(function () {
                        _this.loading = false;
                    });
            },
            //получает данные о балансе из скопа контроллера приложения
            getBalance: function (account) {

                var result = $scope.balance.data.filter(function (obj) {
                    return obj.account.id === account.id && obj.amount != 0;
                });

                if (result.length > 0) {
                    return result[0].currencies;
                } else {
                    return [];
                }
            },
            //получает данные о балансе из скопа контроллера приложения валюте
            getBalanceByCurrency: function (account, currency) {

                var result = this.getBalance(account).filter(function (obj) {
                    return obj.currency.id === currency.id;
                });

                if (result.length > 0) {
                    return result[0].amount;
                } else {
                    return 0;
                }
            },
            //проверяет используется ли валюта для данного счета
            isCurrencyUsed: function (account, currency) {

                var result = account.currencies.filter(function (obj) {
                    return obj.currency !== null && obj.currency.id === currency.id;
                });

                return result.length > 0;
            },
            isActive: function (account) {
                return account.id == this.account.id;
            },
            getImportTypes: function () {
                return [
                    {
                        value: 'privatbank',
                        name: 'Приват Банк'
                    }
                ]
            },
            //инициализирует изменение объекта или создание нового
            edit: function (account) {

                this.account.editing = true;
                this.account.errors = {};

                if (typeof(account) === 'object') {
                    this.account.fillByObject(account);
                    this.selected = account;
                } else {
                    this.account.fillDefault();
                    this.selected = undefined;
                }
            },
            cancelEditing: function () {

                this.account.editing = false;

                if (this.selected) {
                    this.account.fillByObject(this.selected);
                } else {
                    this.account.fillDefault();
                }
            },
            account: {
                currencies: [],
                //проверяет является ли объект новым или же это редактирование существующего
                isNew: function () {
                    return this.id === 0;
                },
                checkCurrenciesUsed: function () {
                    var result = this.currencies.filter(function (obj) {
                        return obj.used;
                    });

                    return result.length > 0;
                },
                //заполнение полей по умолчанию (для новых)
                fillDefault: function () {
                    this.id = 0;
                    this.name = "";
                    this.color = "#009688";
                    this.active = true;
                    this.countTrans = 0;
                    this.isTransfer = false;
                    this.import = false;
                    this.fillCurrency();
                },
                //заполнение полей по переданному объекту
                fillByObject: function (account) {
                    this.fillDefault();
                    angular.forEach(account, function (value, key) {
                        this[key] = value;
                    }, this);
                    this.active = !!account.active;
                    this.import = !!account.import;
                    this.fillCurrency(account);
                    this.importType = this.findImportType(account.importType)
                },
                //заполняет массив валют, которые используются в счете
                fillCurrency: function (account) {

                    this.currencies = [];

                    if (!account) {
                        angular.forEach(currencies.data, function (value) {
                            var obj = {currency: value, used: $scope.profile.isMainCurrency(value)};
                            this.push(obj);
                        }, this.currencies);
                    } else {
                        angular.forEach(currencies.data, function (value) {
                            var obj = {currency: value, used: $scope.scope.isCurrencyUsed(account, value)};
                            this.push(obj);
                        }, this.currencies);
                    }
                },
                findImportType: function (value) {

                    var objects = $scope.scope.getImportTypes();
                    var filteredObjects = objects.filter(function (obj) {
                        return obj.value === value;
                    });

                    if (filteredObjects.length > 0) {
                        return filteredObjects[0];
                    }

                    //если не удалось найти вернем пустой объект
                    return {};
                },
                //отправляет запрос на сохранение объекта
                save: function () {

                    var _this = this;

                    //проверим используется ли хотя бы одна валюта
                    if (!_this.checkCurrenciesUsed()) {
                        notifyService.alertWarning('Необходимо установить хотя бы одну валюту');
                        return;
                    }

                    _this.submitting = true;
                    _this.errors = {};

                    notifyService.showLoadBar();

                    account.save(_this)
                        .then(function (response) {
                            return account.setCurrencies(response.data.id, _this.currencies);
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
                        .then(function (response) {
                            notifyService.notify('Счет сохранен');
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

                    //проверим нет ли операций в данной категории
                    if (_this.countTrans > 0) {
                        notifyService.alertWarning('Перед удалением необходимо перенести операции на другой счет');
                        return;
                    }

                    _this.errors = {};

                    notifyService.confirmDelete("Удалить счет " + _this.name + "?", function () {

                        notifyService.showLoadBar();

                        account.delete(_this)
                            .then(function () {
                                notifyService.notify("Счет " + _this.name + " удален");
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
                //отправляет запрос на перенос операций на другой счет
                moveTransactionsToAccount: function () {

                    var _this = this;
                    var newAccount = $scope.scope.newAccount;

                    //проверим выбран ли новый счет
                    if (!newAccount || newAccount.id === "") {
                        notifyService.alertWarning('Не выбран счет, на который будут перенесены операции');
                        return;
                    }

                    notifyService.confirmWarning("Перенести операции на счет " + newAccount.name + "?",
                        'Перенести',
                        function () {

                            notifyService.showLoadBar();

                            account.moveTransactionsToAccount(_this, newAccount)
                                .then(function (response) {

                                    var countTrans = response.data;

                                    if (countTrans === 0) {
                                        notifyService.notify("Не обнаружено операций для переноса");
                                    } else {
                                        notifyService.notify("Все операции (" + countTrans + ") перенесены на счет " + newAccount.name);
                                        $scope.scope.update();
                                        _this.countTrans = 0;
                                        _this.editing = true;
                                        $scope.scope.newAccount = undefined;
                                        $scope.balance.update();
                                    }
                                }, function (error) {
                                    if (error.data) {
                                        notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                                    }
                                })
                                .finally(function () {
                                    notifyService.hideLoadBar();
                                });
                        }, false);
                }
            },
            colorpicker: {
                opened: false,
                open: function () {
                    this.color = $scope.scope.account.color;
                    this.opened = true;
                },
                close: function () {
                    this.opened = false;
                },
                pick: function () {
                    $scope.scope.account.color = this.color;
                    this.close();
                }
            }
        };

        // Передадим отсортированные данные в scope
        $scope.scope.data = $scope.global.sortDataByField(accounts.data, 'countTrans');

        if (!$scope.global.isMobile()) {
            $scope.scope.edit($scope.scope.data[0]);
        }
    }]);
