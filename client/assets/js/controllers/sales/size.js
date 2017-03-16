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
                checkFilling: function () {
                    return this.sizes.length > 0;
                },
                //заполнение полей по умолчанию (для новых)
                fillDefault: function () {
                    this.id = 0;
                    this.name = "";
                    this.sizes = [];
                },
                //заполнение полей по переданному объекту
                fillByObject: function (category) {
                    angular.forEach(category, function (value, key) {
                        this[key] = value;
                    }, this);
                },
                //отправляет запрос на сохранение объекта
                save: function () {

                    var _this = this;

                    _this.submitting = true;
                    _this.errors = [];

                    if (!_this.checkFilling()) {
                        _this.submitting = false;
                        _this.errors.push({'message': ' Необходимо указать хотя бы один размер'});
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
                    size.editing = true;
                },
                cancelEditing: function (size) {
                    size.editing = false;
                }
            }
        };

        if (!$scope.global.isMobile()) {
            $scope.scope.edit($scope.scope.data[0]);
        }

    }]);
