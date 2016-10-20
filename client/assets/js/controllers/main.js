App
    .controller('AppCtrl', ['$scope', '$state', '$rootScope', 'balance', 'profile', 'account', 'category', 'transaction', 'notifyService',
        function ($scope, $state, $rootScope, balance, profile, account, category, transaction, notifyService) {

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
                            _this.dataLoaded = true;
                        })
                        .catch(function (error) {
                            notifyService.notifyError(_this.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            notifyService.hideLoadBar();
                            if (_this.dataLoaded) {
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
                }
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
                    if ($(".sweet-alert.visible, .modal-backdrop").length > 0) {
                        return false;
                    } else {
                        return true;
                    }
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
                update: function () {

                    var _this = this;
                    _this.loading = true;
                    _this.error = false;
                    _this.data = [];

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
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                },
                adjustment: {
                    calledFromMenu: false,
                    open: function (account, currency, currentBalance, calledFromMenu) {
                        $scope.balance.adjusted = true;
                        $scope.sidebar.opened = false;
                        this.account = account;
                        this.currency = currency;
                        this.oldBalance = currentBalance;
                        this.newBalance = currentBalance;
                        this.calledFromMenu = calledFromMenu;
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
                        var oldBalance = parseFloat(_this.oldBalance);
                        var newBalance = parseFloat(_this.newBalance);

                        if (oldBalance === newBalance) {
                            _this.close();
                            return;
                        }

                        _this.submitting = true;
                        _this.errors = {};

                        balance.adjust(accountId, currencyId, newBalance)
                            .then(function () {
                                _this.close();
                                notifyService.notify('Баланс изменен');
                                $scope.balance.update();
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
                            });
                    }
                }
            };

            // Transaction
            $scope.transaction = {
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

                    if (typeof(transaction) === 'object') {
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
                    this.date = this.date ? this.date : moment().toDate();
                    this.amount = this.amount ? this.amount : "";
                    this.account = defaultAccount;
                    this.category = defaultCategory;
                    this.currency = defaultCurrency;
                    this.comment = '';

                    if (this.transfer) {

                        var defaultRecipientAccount = this.getDefaultAccount(true);
                        var defaultRecipientCurrency = this.getDefaultCurrency(defaultRecipientAccount, true);

                        this.recipientAmount = this.recipientAmount ? this.recipientAmount : "";
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
                },
                checkFilling: function () {

                    var result = true;

                    result = this.checkAccount()
                        && this.checkCurrency()
                        && (this.income ? this.checkCategoryIncome() : true)
                        && (this.expense ? this.checkCategoryExpense() : true)
                        && (this.transfer ? this.checkRecipientAccount() : true)
                        && (this.transfer ? this.checkRecipientCurrency() : true);

                    return result;
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
                // действия, которые будут выпонены после сохранения или удаления операции
                afterEdit: function () {

                    //обновим данные о балансе
                    $scope.balance.update();

                    //для определенных состояний необходимо обновить список операций
                    var currentStateName = $state.current.name;
                    var stateNames = [
                        'transactions.list',
                        'dashboard'
                    ];

                    if (stateNames.indexOf(currentStateName) != -1) {
                        if (angular.isFunction(this.callback)) {
                            this.callback.call();
                        }
                    }
                },
                save: function () {

                    var _this = this;

                    _this.submitting = true;
                    _this.errors = {};

                    if (!_this.checkFilling()) {
                        return;
                    }

                    notifyService.showLoadBar();

                    transaction.save(_this)
                        .then(function (response) {
                            notifyService.notify('Операция сохранена');
                            _this.fillDefault();
                            _this.editing = false;
                            _this.afterEdit();
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
                                _this.fillDefault();
                                _this.editing = false;
                                _this.afterEdit();
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
            };

            // Init controller
            function init() {
                $scope.profile.update();
                $scope.balance.update();
            }

            init();
        }
    ])
    .controller('DashboardCtrl', ['$scope', 'transaction', 'transactions', 'notifyService',
        function ($scope, transaction, transactions, notifyService) {

            var today = moment().toDate();

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
                currentDate: today,
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
                    $scope.scope.transactions.update();
                },
                setCurrentDateAsToday: function () {
                    this.currentDate = moment().toDate();
                    $scope.scope.transactions.update();
                },
                transactions: {
                    data: transactions.data,
                    update: function () {

                        var _this = this;

                        _this.loading = true;
                        _this.error = false;
                        _this.data = [];

                        var filter = {
                            date: $scope.scope.currentDate
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
                    }
                }
            };

            //установим коллбэк после записи операции
            $scope.transaction.callback = function () {
                $scope.scope.transactions.update();
            };
        }])
    .controller('TransactionsListCtrl', ['$scope', 'transaction', 'transactions', 'notifyService',
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
                toggleSelected: function (item) {
                    item.selected = !item.selected;
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
                                .then(function () {
                                    _this.data = _this.data.filter(function (item) {
                                        return item.id != obj.id;
                                    });
                                    _this.totalCount--;
                                }, function () {
                                    failures++;
                                })
                                .finally(function () {
                                    if (lastIteration) {
                                        notifyService.hideLoadBar();
                                        if (failures == 0) {
                                            notifyService.notify("Операции удалены");
                                        } else {
                                            notifyService.notifyError("Не удалось удалить " + countSelected + " операции");
                                        }
                                    }
                                });
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
                    clear: function () {
                        this.items = {};
                    },
                    submit: function () {
                        this.close();
                        $scope.scope.update(true);
                    }
                }
            };

            //установим коллбэк после записи операции
            $scope.transaction.callback = function () {
                $scope.scope.update(true);
            };
        }])
    .controller('TemplatesCtrl', ['$scope', function ($scope) {

    }])
    .controller('AccountsCtrl', ['$scope', 'currencies', 'accounts', 'account', 'notifyService',
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
                //инициализирует изменение объекта или создание нового
                edit: function (account) {

                    this.account.editing = true;
                    this.account.errors = {};

                    if (typeof(account) === 'object') {
                        this.account.fillByObject(account);
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
                        this.fillCurrency();
                    },
                    //заполнение полей по переданному объекту
                    fillByObject: function (account) {
                        this.fillDefault();
                        angular.forEach(account, function (value, key) {
                            this[key] = value;
                        }, this);
                        this.active = account.active ? true : false;
                        this.fillCurrency(account);
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
                                _this.fillDefault();
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
        }])
    .controller('CategoriesCtrl', ['$scope', 'categories', 'category', 'notifyService',
        function ($scope, categories, category, notifyService) {

            // Scope object
            $scope.scope = {
                data: [],
                update: function () {

                    var _this = this;

                    _this.loading = true;
                    _this.error = false;
                    _this.data = [];

                    _this.category.editing = false;

                    category.get()
                        .success(function (data) {

                            _this.data = $scope.global.sortDataByField(data, 'countTrans');
                            ;

                            // обновим глобальный массив категорий
                            $scope.global.categories = _this.data;
                        })
                        .error(function (error) {
                            _this.error = true;
                            notifyService.notifyError($scope.global.errorMessages.generateGet(error));
                        })
                        .finally(function () {
                            _this.loading = false;
                        });
                },
                //инициализирует изменение объекта или создание нового
                edit: function (category) {

                    this.category.editing = true;
                    this.category.errors = {};

                    if (typeof(category) === 'object') {
                        this.category.fillByObject(category);
                    } else {
                        this.category.fillDefault();
                    }
                },
                category: {
                    //проверяет является ли объект новым или же это редактирование существующего
                    isNew: function () {
                        return this.id === 0;
                    },
                    //заполнение полей по умолчанию (для новых)
                    fillDefault: function () {
                        this.id = 0;
                        this.name = "";
                        this.icon = "";
                        this.income = false;
                        this.expense = true;
                        this.active = true;
                        this.countTrans = 0;
                        this.isTransfer = false;
                    },
                    //заполнение полей по переданному объекту
                    fillByObject: function (category) {
                        this.fillDefault();
                        angular.forEach(category, function (value, key) {
                            this[key] = value;
                        }, this);
                        this.income = category.income ? true : false;
                        this.expense = category.expense ? true : false;
                        this.active = category.active ? true : false;
                    },
                    //отправляет запрос на сохранение объекта
                    save: function () {

                        var _this = this;

                        _this.submitting = true;
                        _this.errors = {};

                        notifyService.showLoadBar();

                        category.save(_this)
                            .then(function (response) {
                                notifyService.notify('Категория сохранена');
                                _this.fillDefault();
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

                        //проверим нет ли операций в данной категории
                        if (_this.countTrans > 0) {
                            notifyService.alertWarning('Перед удалением необходимо перенести операции в другую категорию');
                            return;
                        }

                        _this.errors = {};

                        notifyService.confirmDelete("Удалить категорию " + _this.name + "?", function () {

                            notifyService.showLoadBar();

                            category.delete(_this)
                                .then(function () {
                                    notifyService.notify("Категория " + _this.name + " удалена");
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
                    //отправляет запрос на перенос операций в другую категорию
                    moveTransactionsToCategory: function () {

                        var _this = this;
                        var newCategory = $scope.scope.newCategory;

                        //проверим выбрана ли новая категория
                        if (!newCategory || newCategory.id === "") {
                            notifyService.alertWarning('Не выбрана категория, в которую будут перенесены операции');
                            return;
                        }

                        notifyService.confirmWarning("Перенести операции в категорию " + newCategory.name + "?",
                            'Перенести',
                            function () {

                                notifyService.showLoadBar();

                                category.moveTransactionsToCategory(_this, newCategory)
                                    .then(function (response) {

                                        var countTrans = response.data;

                                        if (countTrans === 0) {
                                            notifyService.notify("Не обнаружено операций для переноса");
                                        } else {
                                            notifyService.notify("Все операции (" + countTrans + ") перенесены в категорию " + newCategory.name);
                                            $scope.scope.update();
                                            _this.countTrans = 0;
                                            _this.editing = true;
                                            $scope.scope.newCategory = undefined;
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
                iconpicker: {
                    iconClass: "fa",
                    iconClassFix: "fa-",
                    icons: ["", "adjust", "anchor", "archive", "area-chart", "automobile", "asterisk", "at", "ban", "bank", "bar-chart-o", "barcode", "bars", "beer", "bell", "bell-o", "bicycle", "binoculars", "birthday-cake", "bolt", "bomb", "book", "bookmark", "bookmark-o", "briefcase", "bug", "building", "building-o", "bullhorn", "bullseye", "bus", "cab", "calculator", "calendar", "calendar-o", "camera", "camera-retro", "car", "cc-amex", "cc-discover", "cc-mastercard", "cc-paypal", "cc-stripe", "cc-visa", "certificate", "check", "check-circle", "check-circle-o", "child", "circle", "circle-o", "circle-thin", "clock-o", "cloud", "cloud-download", "cloud-upload", "code", "code-fork", "coffee", "cog", "cogs", "comment", "comment-o", "comments", "comments-o", "compass", "copyright", "credit-card", "crop", "crosshairs", "cube", "cubes", "cutlery", "dashboard", "database", "desktop", "dot-circle-o", "download", "edit", "envelope", "envelope-o", "envelope-square", "exchange", "exclamation", "exclamation-circle", "exclamation-triangle", "external-link", "external-link-square", "eye", "eye-slash", "eyedropper", "fax", "female", "fighter-jet", "film", "filter", "fire", "fire-extinguisher", "flag", "flag-checkered", "flag-o", "flash", "flask", "folder", "folder-o", "folder-open", "folder-open-o", "frown-o", "futbol-o", "gamepad", "gavel", "gift", "glass", "globe", "graduation-cap", "group", "hdd-o", "headphones", "heart", "heart-o", "history", "home", "image", "inbox", "info", "info-circle", "institution", "key", "keyboard-o", "language", "laptop", "leaf", "legal", "lemon-o", "level-down", "level-up", "life-saver", "lightbulb-o", "line-chart", "location-arrow", "lock", "magic", "magnet", "male", "map-marker", "meh-o", "microphone", "microphone-slash", "minus-square", "mobile", "moon-o", "mortar-board", "music", "navicon", "newspaper-o", "paint-brush", "paper-plane", "paper-plane-o", "paw", "pencil", "pencil-square", "pencil-square-o", "phone", "phone-square", "photo", "picture-o", "pie-chart", "plane", "plug", "plus-square", "power-off", "print", "puzzle-piece", "qrcode", "question", "question-circle", "random", "refresh", "reorder", "retweet", "road", "rocket", "rss", "rss-square", "search", "shield", "shopping-cart", "signal", "sitemap", "sliders", "smile-o", "soccer-ball-o", "space-shuttle", "spinner", "spoon", "square", "square-o", "star", "suitcase", "sun-o", "support", "tablet", "tachometer", "tag", "tags", "tasks", "taxi", "thumb-tack", "thumbs-down", "thumbs-o-down", "thumbs-o-up", "thumbs-up", "ticket", "times", "trash", "tree", "trophy", "truck", "tty", "umbrella", "university", "unlock", "unlock-alt", "unsorted", "upload", "user", "users", "video-camera", "volume-down", "volume-off", "volume-up", "warning", "wheelchair", "wifi", "wrench", "bitcoin", "cny", "dollar", "euro", "gbp", "ils", "inr", "money", "ruble", "rupee", "shekel", "turkish-lira", "won", "yen", "youtube-play", "adn", "android", "angellist", "apple", "behance", "behance-square", "bitbucket", "bitbucket-square", "css3", "delicious", "digg", "dribbble", "dropbox", "drupal", "empire", "facebook", "facebook-square", "flickr", "foursquare", "ge", "git", "git-square", "github", "github-alt", "github-square", "gittip", "google", "google-plus", "google-plus-square", "google-wallet", "hacker-news", "html5", "instagram", "ioxhost", "joomla", "jsfiddle", "lastfm", "lastfm-square", "linkedin", "linkedin-square", "linux", "maxcdn", "meanpath", "openid", "pagelines", "paypal", "pied-piper", "pied-piper-alt", "pinterest", "pinterest-square", "qq", "ra", "rebel", "reddit", "reddit-square", "renren", "skype", "slack", "slideshare", "soundcloud", "spotify", "stack-exchange", "stack-overflow", "steam", "steam-square", "stumbleupon", "stumbleupon-circle", "tencent-weibo", "trello", "tumblr", "tumblr-square", "twitch", "twitter", "twitter-square", "vimeo-square", "vine", "vk", "wechat", "weibo", "weixin", "windows", "wordpress", "xing", "xing-square", "yahoo", "yelp", "youtube", "ambulance", "h-square", "hospital-o", "medkit", "stethoscope", "user-md"],
                    opened: false,
                    open: function () {
                        this.opened = true;
                    },
                    close: function () {
                        this.opened = false;
                    },
                    pick: function (iconName) {
                        $scope.scope.category.icon = this.generateClassString(iconName);
                        this.close();
                    },
                    generateClassString: function (iconName) {
                        return iconName == "" ? "" : this.iconClass + " " + this.iconClassFix + iconName;
                    },
                    isActive: function (iconName) {
                        return this.generateClassString(iconName) == $scope.scope.category.icon;
                    }
                }
            };

            // Передадим отсортированные данные в scope
            $scope.scope.data = $scope.global.sortDataByField(categories.data, 'countTrans');
            ;
        }])
    .controller('CurrenciesCtrl', ['$scope', 'currencies', 'currency', 'notifyService',
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
                //инициализирует изменение объекта или создание нового
                edit: function (currency) {

                    this.currency.editing = true;
                    this.currency.errors = {};

                    if (typeof(currency) === 'object') {
                        this.currency.fillByObject(currency);
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
                            this[key] = value;
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
                                _this.fillDefault();
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
        }])
    .controller('SettingsCtrl', ['$scope', 'notifyService', function ($scope, notifyService) {

        $scope.sections = {
            interface: {
                edit: false,
                data: [
                    {
                        name: 'Отображать панель виджетов',
                        //value: $scope.profile.displayWidgets
                    },
                    {
                        name: 'Отображать блок баланса',
                        //value: $scope.profile.displayBalance
                    },
                    {
                        name: 'Отображать блок графика',
                        //value: $scope.profile.displayChart
                    },
                    {
                        name: 'Отображать блок операций',
                        //value: $scope.profile.displayTransactions
                    }
                ]
            }
        };

        $scope.saveSettings = function (section) {
            notifyService.notify('Данные сохранены', 'error');
        }
    }]);
