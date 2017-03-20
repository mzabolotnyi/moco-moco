App.controller('SizesCtrl', ['$scope', 'size', 'sizeCategory', 'categories', 'notifyService',
    function ($scope, size, sizeCategory, categories, notifyService) {

        // Scope object
        $scope.scope = {
            data: categories.data,
            update: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                _this.category.editing = false;

                sizeCategory.get()
                    .success(function (response) {
                        _this.data = response;
                        if (_this.selected) {
                            angular.forEach(_this.data, function ($obj) {
                                if ($obj.id === _this.selected.id) {
                                    this.edit($obj);
                                }
                            }, _this);
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
            isActive: function (category) {
                return category.id == this.category.id;
            },
            getPreview: function (category) {

                var sizes = [];

                angular.forEach(category.sizes, function (size) {
                    this.push(size.name);
                }, sizes);

                return sizes.join(', ');
            },
            //инициализирует изменение объекта или создание нового
            edit: function (category) {

                this.category.editing = true;
                this.category.errors = {};

                if (typeof(category) === 'object') {
                    this.category.fillByObject(category);
                    this.selected = category;
                } else {
                    this.category.fillDefault();
                    this.selected = undefined;
                }
            },
            cancelEditing: function () {

                this.category.editing = false;

                if (this.selected) {
                    this.category.fillByObject(this.selected);
                } else {
                    this.category.fillDefault();
                }
            },
            category: {
                //проверяет является ли объект новым или же это редактирование существующего
                isNew: function () {
                    return this.id === 0;
                },
                validate: function () {

                    var success = true;

                    if (this.name == '') {
                        this.errors.push({'message': 'Необходимо указать название категории'});
                        success = false;
                    }

                    if (this.sizes.length == 0) {
                        this.errors.push({'message': 'Необходимо указать хотя бы один размер'});
                        success = false;
                    }

                    angular.forEach(this.sizes, function (size) {
                        if (size.name == '') {
                            size.editing = true;
                            size.errors.push({'message': 'Необходимо указать название размера'});
                            success = false;
                        }
                    }, this.errors);

                    return success;
                },
                //заполнение полей по умолчанию (для новых)
                fillDefault: function () {
                    this.id = 0;
                    this.name = "";
                    this.sizes = [];
                    this.sizesOrigin = [];
                },
                //заполнение полей по переданному объекту
                fillByObject: function (category) {
                    this.id = category.id;
                    this.name = category.name;
                    this.sizesOrigin = category.sizes;
                    this.sizes = JSON.parse(JSON.stringify(category.sizes));
                },
                //отправляет запрос на сохранение объекта
                save: function () {

                    var _this = this;

                    _this.submitting = true;
                    $scope.scope.size.clear();
                    _this.errors = [];

                    if (!_this.validate()) {
                        if (_this.errors.length == 0) {
                            _this.errors.push({'message': 'При проверке данных были обнаружены ошибки'});
                        }
                        _this.submitting = false;
                        return;
                    }

                    notifyService.showLoadBar();

                    sizeCategory.save(_this)
                        .then(function () {
                            notifyService.notify('Категория сохранена');
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

                    notifyService.confirmDelete("Удалить категорию " + _this.name + "?", function () {

                        notifyService.showLoadBar();

                        sizeCategory.delete(_this)
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
                }
            },
            size: {
                edit: function (size) {
                    this.clear();
                    size.editing = true;
                },
                cancelEditing: function (size) {
                    size.editing = false;
                },
                clear: function () {
                    angular.forEach($scope.scope.category.sizes, function (obj) {
                        this.cancelEditing(obj);
                        obj.errors = [];
                    }, this);
                },
                add: function () {

                    var newSize = {
                        'name': ''
                    };

                    $scope.scope.category.sizes.push(newSize);
                    this.edit(newSize);
                },
                remove: function (size) {
                    var index = $scope.scope.category.sizes.indexOf(size);
                    $scope.scope.category.sizes.splice(index, 1);
                }
            }
        };

        if (!$scope.global.isMobile()) {
            $scope.scope.edit($scope.scope.data[0]);
        }

    }]);
