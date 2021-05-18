App.controller('AppCtrl', ['$scope', '$state', '$rootScope', '$localStorage', 'balance', 'profile', 'account', 'category', 'transaction', 'notifyService', 'currency', 'importService',
    function ($scope, $state, $rootScope, $localStorage, balance, profile, account, category, transaction, notifyService, currency, importService) {

        // Global values
        $scope.global = {
            isMobile: function () {
                return $rootScope.isMobile;
            },
            errorMessages: {
                get: 'Ошибка при получении данных',
                post: 'Ошибка при отправке данных',
                generate: function (error, message) {

                    // ошибка не определена, вероятней всего превишен timeout запроса
                    if (!error) {
                        return 'Превышено максимальное время выполнения запроса';
                    }

                    var status;

                    if (error.status) {
                        status = error.status;
                    } else {
                        status = 500;
                    }

                    return message.concat(' (', status.toString(), ')');
                },
                generateGet: function (error, message) {
                    return this.generate(error, message ? message : this.get);
                },
                generatePost: function (error, message) {
                    return this.generate(error, message ? message : this.post);
                }
            },
            accounts: [],
            categories: [],
            currencies: [],
            //загружает необходимые данные для ввода операций (например: счета, категории)
            loadData: function (callback) {

                var _this = this;

                account.get()
                    .then(function (response) {
                        _this.accounts = _this.sortDataByField(response.data, 'countTrans');
                        return category.get();
                    })
                    .then(function (response) {
                        _this.categories = _this.sortDataByField(response.data, 'countTrans');
                        return currency.get();
                    })
                    .then(function (response) {
                        _this.currencies = response.data;
                        _this.dataLoaded = true;
                    })
                    .catch(function (error) {
                        notifyService.notifyError(_this.errorMessages.generateGet(error));
                    })
                    .finally(function () {
                        notifyService.hideLoadBar();
                        if (_this.dataLoaded && callback) {
                            callback.call();
                        }
                    });
            },
            sortDataByField: function (data, field) {
                data.sort(function (obj1, obj2) {
                    return obj2[field] - obj1[field];
                });

                return data;
            },
            includeObject: function (array, value, idFieldName) {

                var filteredArray = array.filter(function (obj) {
                    return !idFieldName ? obj === value : obj[idFieldName] === value[idFieldName];
                });

                return filteredArray.length > 0;
            },
            toMain: function () {
                $state.go('dashboard', {}, {reload: true});
            },
            image: {
                getSrc: function (object) {

                    if (!object) {
                        return null;
                    }

                    if (object.data) {
                        return object.data;
                    }

                    if (object.path) {
                        return object.path;
                    }

                    return null;
                },
                hasSrc: function (object) {
                    return !!this.getSrc(object);
                }
            },
            goToUrl: function (url) {
                window.open(url, '_blank');
            },
            alertInDevelopment: function () {
                notifyService.alert('На данный момент функционал находится в разработке', 'info');
            },
        };

        // Sidebar
        $scope.sidebar = {
            opened: false,
            toggle: function () {
                this.opened = !this.opened;
            },
            open: function () {
                this.opened = true;
            },
            close: function () {
                this.opened = false;
            },
            showOverlayOnOpened: function () {
                return this.opened && $scope.global.isMobile();
            },
            profileMenu: {
                opened: false,
                toggle: function () {
                    this.opened = !this.opened;
                }
            },
            swipeIn: function () {
                if (!this.opened && this.canSwipe()) {
                    this.open();
                }
            },
            swipeOut: function () {
                if (this.opened && this.canSwipe()) {
                    this.close();
                }
            },
            canSwipe: function () {
                // если есть видимые модальные окна, то меню нельзя открыть
                return !($(".sweet-alert.visible, .modal-backdrop").length > 0 || !$scope.global.isMobile());
            }
        };

        // Profile
        $scope.profile = {
            data: {},
            update: function () {

                var _this = this;
                _this.error = false;

                profile.get()
                    .success(function (response) {
                        _this.data = response;
                    })
                    .error(function (error) {
                        _this.error = true;
                        notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                    });
            },
            save: function () {

                var _this = this;

                profile.save(this)
                    .then(function () {
                        notifyService.notify('Профиль сохранен');
                        _this.update();
                    }, function (error) {
                        if (error.data) {
                            if (error.status === 422) {
                                _this.errors = error.data;
                            } else {
                                _this.errors = [error.data];
                                notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                            }
                        }
                    });
            },
            updateMainCurrency: function (currency) {

                var _this = this;

                notifyService.showLoadBar();

                profile.updateMainCurrency(currency.id)
                    .then(function () {
                        notifyService.notify(currency.name + ' установлена в качестве основной валюты');
                        _this.update();
                        $scope.balance.update();
                    }, function (error) {
                        notifyService.notifyError(global.errorMessages.generatePost(error));
                    })
                    .finally(function () {
                        notifyService.hideLoadBar();
                    });
            },
            isMainCurrency: function (currency) {
                return currency.id === this.data.currency.id;
            }
        };

        // Balance
        $scope.balance = {
            data: [],
            amount: 0,
            amountInMainCurrency: 0,
            amountInOtherCurrency: 0,
            reset: function () {
                this.data = [];
                this.amount = 0;
                this.amountInMainCurrency = 0;
                this.amountInOtherCurrency = 0;
            },
            update: function () {

                var _this = this;

                _this.error = false;

                if (!$scope.global.updateInBackground) {
                    _this.loading = true;
                    _this.reset();
                }

                balance.get()
                    .success(function (response) {

                        _this.data = response;

                        _this.amount = 0;
                        _this.amountInMainCurrency = 0;

                        angular.forEach(_this.data, function (value, key) {
                            _this.amount += value.amount;
                            _this.amountInMainCurrency += value.amountInMainCurrency;
                        });

                        _this.amountInOtherCurrency = _this.amount - _this.amountInMainCurrency;
                    })
                    .error(function (error) {

                        if ($scope.global.updateInBackground) {
                            _this.reset();
                        }

                        _this.error = true;
                        notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                    })
                    .finally(function () {
                        _this.loading = false;
                    });
            },
            adjustment: {
                calledFromMenu: false,
                savedCategoryAlias: 'adjustment-category',
                setCategory: function (category) {
                    if (category) {
                        $localStorage[this.savedCategoryAlias] = category.id;
                    } else {
                        delete $localStorage[this.savedCategoryAlias];
                    }
                },
                getCategory: function () {

                    var categoryId = $localStorage[this.savedCategoryAlias];

                    var categories = $scope.global.categories.filter(function (obj) {
                        return obj.id === categoryId;
                    });

                    if (categories.length > 0) {
                        return categories[0];
                    }

                    return null;
                },
                open: function (account, currency, currentBalance, calledFromMenu) {

                    var _this = this;

                    $scope.sidebar.opened = false;

                    //данные для ввода операций еще не подгружены - выполним загрузку
                    if (!$scope.global.dataLoaded) {

                        notifyService.showLoadBar();
                        $scope.global.loadData(function () {
                            _this.open(account, currency, currentBalance, calledFromMenu);
                        });

                        return;
                    }

                    $scope.balance.adjusted = true;

                    _this.account = account;
                    _this.currency = currency;
                    _this.category = _this.getCategory();
                    _this.oldBalance = currentBalance;
                    _this.newBalance = currentBalance;
                    _this.calledFromMenu = calledFromMenu;
                },
                close: function () {
                    $scope.balance.adjusted = false;
                    if (this.calledFromMenu) {
                        $scope.sidebar.opened = true;
                        this.calledFromMenu = false;
                    }
                },
                submit: function () {

                    var _this = this;
                    var accountId = _this.account.id;
                    var currencyId = _this.currency.id;
                    var categoryId = _this.category ? _this.category.id : null;
                    var oldBalance = parseFloat(_this.oldBalance);
                    var newBalance = parseFloat(_this.newBalance);

                    $scope.global.updateInBackground = true;

                    if (oldBalance === newBalance) {
                        _this.close();
                        return;
                    }

                    _this.submitting = true;
                    _this.errors = {};

                    balance.adjust(accountId, currencyId, newBalance, categoryId)
                        .then(function () {
                            _this.close();
                            notifyService.notify('Баланс изменен');
                            $scope.balance.update();
                            _this.afterAdjust();
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
                            $scope.global.updateInBackground = false;
                        });
                },
                // действия, которые будут выпонены после изменения баланса
                afterAdjust: function () {

                    this.setCategory(this.category);

                    //для определенных состояний необходимо обновить список операций
                    var currentStateName = $state.current.name;
                    var stateNames = [
                        'transactions.list',
                        'dashboard'
                    ];

                    if (stateNames.indexOf(currentStateName) !== -1) {
                        if (angular.isFunction(this.callback)) {
                            this.callback.call();
                        }
                    }
                }
            }
        };

        // Transaction
        $scope.transaction = {
            currentDate: moment().toDate(),
            //проверяет является ли объект новым или же это редактирование существующего
            isNew: function () {
                return this.id === 0;
            },
            //проверяет является ли операция переводом между разными валютами
            isDifferentCurrency: function () {
                return this.transfer && this.currency.id !== this.recipientCurrency.id
            },
            //обработчик изменения счета
            accountChangeHandler: function (isRecipient) {

                //обновим валюту
                if (isRecipient) {
                    this.recipientCurrency = this.getDefaultCurrency(this.recipientAccount, true);
                } else {
                    this.currency = this.getDefaultCurrency(this.account);
                }
            },
            //обработчик изменения суммы
            amountChangeHandler: function () {

                var recipientAmount = this.isDifferentCurrency() ? this.recipientAmount : this.amount;

                if (this.recipientAmount != recipientAmount) {
                    this.recipientAmount = recipientAmount;
                }
            },
            //подбирает категорию по умолчанию по типу операции
            //если категория уже заполнена и она соответствует типу операции возвращает ее
            getDefaultCategory: function (type) {

                //если текущая категория соответствует виду операции вернем ее же
                var currentCategory = this.category;
                var categories = $scope.global.categories;

                if (currentCategory && $scope.global.includeObject(categories, currentCategory) && currentCategory.active) {
                    if ((this.income && currentCategory.income) || (this.expense && currentCategory.expense)) {
                        return currentCategory;
                    }
                }

                //подберем категорию по типу операции (по умолчанию считается категория с наибольшим колиеством операций)
                categories = categories.filter(function (obj) {
                    return obj[type] && obj.active;
                });

                if (categories.length > 0) {
                    return categories[0];
                }

                //это корректировка без категории
                return null;
            },
            //подбирает счет по умолчанию
            getDefaultAccount: function (isRecipient) {

                //если текущий счет указан вернем его же
                var currentAccount = isRecipient ? this.recipientAccount : this.account;
                var accounts = $scope.global.accounts;

                if (currentAccount && $scope.global.includeObject(accounts, currentAccount) && currentAccount.active) {
                    return currentAccount;
                }

                //подберем счет (по умолчанию берется первый в списке)
                accounts = accounts.filter(function (obj) {
                    return obj.active;
                });

                //если это счет получатель при переводе вернем второй по порядку, иначе первый
                if (isRecipient && accounts.length > 1) {
                    return accounts[1];
                }

                if (accounts.length > 0) {
                    return accounts[0];
                }

                //если не удалось подобрать вернем пустой объект
                return {};
            },
            //подбирает валюту по умолчанию для счета
            getDefaultCurrency: function (account, isRecipient) {

                var currentCurrency = isRecipient ? this.recipientCurrency : this.currency;
                var currencies = account.currencies;

                //подберем валюту (по ссылке на объект или по ид)
                var filteredCurrencies = currencies.filter(function (obj) {
                    return currentCurrency && (obj.currency === currentCurrency || obj.currency.id === currentCurrency.id);
                });

                if (filteredCurrencies.length > 0) {
                    return filteredCurrencies[0].currency;
                }

                //если не удалось подобрать вернем первую валюту из списка
                return currencies[0].currency;
            },
            findAccount: function (id) {

                //поиск объекта в глобальном массиве
                var accounts = $scope.global.accounts;
                var filteredAccounts = accounts.filter(function (obj) {
                    return obj.id === id;
                });

                if (filteredAccounts.length > 0) {
                    return filteredAccounts[0];
                }

                //если не удалось найти вернем пустой объект
                return {};
            },
            findCategory: function (id) {

                //поиск объекта в глобальном массиве
                var categories = $scope.global.categories;
                var filteredCategories = categories.filter(function (obj) {
                    return obj.id === id;
                });

                if (filteredCategories.length > 0) {
                    return filteredCategories[0];
                }

                //если не удалось найти вернем, это корректировка без категории
                return null;
            },
            findCurrency: function (account, id) {

                //поиск объекта в массиве валют счета
                var currencies = account.currencies;
                var filteredCurrencies = currencies.filter(function (obj) {
                    return obj.currency && obj.currency.id === id;
                });

                if (filteredCurrencies.length > 0) {
                    return filteredCurrencies[0].currency;
                }

                //если не удалось найти вернем пустой объект
                return {};
            },
            edit: function (transaction) {

                $scope.sidebar.opened = false;

                var _this = this;
                _this.loading = true;

                //данные для ввода операций еще не подгружены - выполним загрузку
                if (!$scope.global.dataLoaded) {

                    notifyService.showLoadBar();
                    $scope.global.loadData(function () {
                        _this.edit(transaction);
                    });

                    return;
                }

                var alreadyEditing = _this.editing;

                _this.editing = true;
                _this.errors = {};

                if (typeof (transaction) === 'object' && !transaction.id) {
                    _this.fillByTemplate(transaction);
                } else if (typeof (transaction) === 'object') {
                    _this.fillByObject(transaction);
                } else {
                    _this.fillDefault(transaction, alreadyEditing);
                }

                _this.loading = false;
            },
            fillDefault: function (type, changeType) {

                // если не передан или передан неправильный считаем что это расод
                if (type != 'expense' && type != 'income' && type != 'transfer') {
                    type = 'expense';
                }

                // если это изменение типа операции и новый тип равен текущему - не заполняем
                if (changeType) {
                    if ((type == 'expense' && this.expense) || (type == 'income' && this.income) || (type == 'transfer' && this.transfer)) {
                        return;
                    }
                }

                // заполним свойства значениями по умолчанию
                this.expense = (type == 'expense');
                this.income = (type == 'income');
                this.transfer = (type == 'transfer');

                var defaultAccount = this.getDefaultAccount();
                var defaultCategory = this.getDefaultCategory(type);
                var defaultCurrency = this.getDefaultCurrency(defaultAccount);

                this.id = 0;
                this.externalId = null;

                if (!changeType && $scope.transaction.currentDate) {
                    this.date = $scope.transaction.currentDate;
                } else if (!this.date) {
                    this.date = moment().toDate();
                }

                this.amount = changeType && this.amount ? this.amount : "";
                this.account = defaultAccount;
                this.category = defaultCategory;
                this.currency = defaultCurrency;
                this.comment = '';

                if (this.transfer) {

                    var defaultRecipientAccount = this.getDefaultAccount(true);
                    var defaultRecipientCurrency = this.getDefaultCurrency(defaultRecipientAccount, true);

                    this.recipientAmount = changeType && this.recipientAmount ? this.recipientAmount : "";
                    this.recipientAccount = defaultRecipientAccount;
                    this.recipientCurrency = defaultRecipientCurrency;
                }
            },
            fillByObject: function (transaction) {

                //заполним свойства примитивных типов
                angular.forEach(transaction, function (value, key) {
                    this[key] = value;
                }, this);

                //заполним свойства-объекты
                this.date = moment(transaction.date).toDate();
                this.account = this.findAccount(transaction.account.id);
                this.currency = this.findCurrency(this.account, transaction.currency.id);

                if (this.transfer) {
                    this.recipientAccount = this.findAccount(transaction.recipientAccount.id);
                    this.recipientCurrency = this.findCurrency(this.recipientAccount, transaction.recipientCurrency.id);
                } else {
                    this.category = transaction.category ? this.findCategory(transaction.category.id) : null;
                }

                this.externalId = null;
            },
            fillByTemplate: function (template) {

                var type = template.expense ? 'expense' : 'income';

                this.fillDefault(type);
                this.account = this.findAccount(template.accountId);
                this.currency = this.findCurrency(this.account, template.currencyId);
                this.category = this.findCategory(template.categoryId);
            },
            checkFilling: function () {

                return this.checkAccount()
                    && this.checkCurrency()
                    && (this.income ? this.checkCategoryIncome() : true)
                    && (this.expense ? this.checkCategoryExpense() : true)
                    && (this.transfer ? this.checkRecipientAccount() : true)
                    && (this.transfer ? this.checkRecipientCurrency() : true);
            },
            checkAccount: function () {
                return this.account && $scope.global.includeObject($scope.global.accounts, this.account);
            },
            checkDate: function () {
                return this.date && (this.date instanceof Date || this.date instanceof String);
            },
            checkRecipientAccount: function () {
                return this.recipientAccount && $scope.global.includeObject($scope.global.accounts, this.recipientAccount);
            },
            checkCategory: function () {
                return this.category && $scope.global.includeObject($scope.global.categories, this.category);
            },
            isAdjustment: function () {
                return !this.category
            },
            checkCategoryIncome: function () {
                return this.isAdjustment() || (this.checkCategory() && this.category.income);
            },
            checkCategoryExpense: function () {
                return this.isAdjustment() || (this.checkCategory() && this.category.expense);
            },
            checkCurrency: function () {
                return this.currency && this.checkCurrencyInAccount(this.account, this.currency);
            },
            checkRecipientCurrency: function () {
                return this.recipientCurrency && this.checkCurrencyInAccount(this.recipientAccount, this.recipientCurrency);
            },
            checkCurrencyInAccount: function (account, currency) {

                //отфильтрует массив доступных валют счета по переданной
                var currencies = account.currencies.filter(function (obj) {
                    return obj.currency === currency;
                });

                return currencies.length > 0;
            },
            checkAmount: function () {

                try {
                    math.eval(this.amount);
                    math.eval(this.recipientAmount);
                } catch (e) {
                    this.errors = [{message: 'Не верно указана сумма'}];
                    return false;
                }

                return true;
            },
            calculateAmount: function () {
                this.amount = math.eval(this.amount);
                this.recipientAmount = math.eval(this.recipientAmount);
            },
            // действия, которые будут выпонены после сохранения или удаления операции
            afterEdit: function () {

                $scope.global.updateInBackground = true;

                //обновим данные о балансе
                $scope.balance.update();

                //для определенных состояний необходимо обновить список операций
                var currentStateName = $state.current.name;
                var stateNames = [
                    'transactions.list',
                    'dashboard'
                ];

                if (stateNames.indexOf(currentStateName) !== -1) {
                    if (angular.isFunction(this.callback)) {
                        this.callback.call(this);
                    }
                }

                $scope.global.updateInBackground = false;
            },
            save: function () {

                var _this = this;

                _this.submitting = true;
                _this.errors = {};

                if (!_this.checkFilling() || !_this.checkAmount()) {
                    _this.submitting = false;
                    return;
                }

                _this.calculateAmount();

                notifyService.showLoadBar();

                transaction.save(_this)
                    .then(function (response) {
                        notifyService.notify('Операция сохранена');
                        _this.editing = false;
                        _this.afterEdit();
                        _this.fillDefault();
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

                notifyService.confirmDelete("Удалить операцию?", function () {

                    notifyService.showLoadBar();

                    transaction.delete(_this)
                        .then(function () {
                            notifyService.notify("Операция удалена");
                            _this.editing = false;
                            _this.afterEdit();
                            _this.fillDefault();
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
            types: {
                income: 'Доход',
                expense: 'Расход',
                transfer: 'Перевод'
            }
        };

        // Import Transactions
        $scope.importTransactions = {
            data: [],
            init: function (date, fetch) {

                var _this = this;

                $scope.sidebar.opened = false;

                //данные для ввода операций еще не подгружены - выполним загрузку
                if (!$scope.global.dataLoaded) {

                    notifyService.showLoadBar();
                    $scope.global.loadData(function () {
                        _this.init(date, runImport);
                    });

                    return;
                }

                this.date = date ? date : moment().toDate();
                this.opened = true;

                if (fetch) {
                    this.fetch();
                }
            },
            close: function () {
                this.opened = false;
            },
            getDisplayDate: function () {
                var date = moment(this.date).startOf('day');
                return date.format('D MMMM YYYY');
            },
            fetch: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                importService.getTransactionForImport({'startDate': _this.date, 'endDate': _this.date})
                    .success(function (response) {

                        angular.forEach(response, function (row) {
                            if (row.category) {
                                row.category = $scope.transaction.findCategory(row.category.id);
                            }
                        });

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
            canSubmit: function () {

                var result = false;

                angular.forEach(this.data, function (importTransaction) {
                    if (importTransaction.category) {
                        result = true;
                    }
                });

                return result;
            },
            submit: function () {

                var _this = this;
                _this.submitting = true;

                notifyService.showLoadBar();

                var promises = [];

                angular.forEach(_this.data, function (importTransaction) {

                    if (!importTransaction.category) {
                        return;
                    }

                    importTransaction.income = importTransaction.type === 'income';
                    importTransaction.expense = importTransaction.type === 'expense';
                    importTransaction.transfer = false;

                    var promise = transaction.save(importTransaction);

                    promise.error(function (error) {
                        notifyService.notifyError($scope.global.errorMessages.generatePost(error));
                    });

                    promises.push(promise);
                });

                Promise.all(promises)
                    .finally(function () {
                        notifyService.notify('Импорт операций завершен');
                        notifyService.hideLoadBar();
                        _this.opened = false;
                        _this.submitting = false;
                        $scope.transaction.date = _this.date;
                        $scope.transaction.afterEdit();
                    });
            }
        };

        // Init controller
        function init() {
            $scope.profile.update();
            $scope.balance.update();
        }

        init();
    }
]);
