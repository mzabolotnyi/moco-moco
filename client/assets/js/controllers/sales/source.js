App.controller('SourcesCtrl', ['$scope', 'source', 'sources', 'notifyService',
    function ($scope, source, sources, notifyService) {

        // Scope object
        $scope.scope = {
            data: sources.data,
            update: function () {

                var _this = this;

                _this.loading = true;
                _this.error = false;
                _this.data = [];

                _this.source.editing = false;

                source.get()
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
            isActive: function (source) {
                return source.id == this.source.id;
            },
            //инициализирует изменение объекта или создание нового
            edit: function (source) {

                this.source.editing = true;
                this.source.errors = {};

                if (typeof(source) === 'object') {
                    this.source.fillByObject(source);
                    this.selected = source;
                } else {
                    this.source.fillDefault();
                    this.selected = undefined;
                }
            },
            cancelEditing: function () {

                this.source.editing = false;

                if (this.selected) {
                    this.source.fillByObject(this.selected);
                } else {
                    this.source.fillDefault();
                }
            },
            source: {
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
                        this.errors.push({'message': 'Необходимо указать название источника'});
                        success = false;
                    }

                    return success;
                },
                //заполнение полей по умолчанию (для новых)
                fillDefault: function () {
                    this.id = 0;
                    this.name = "";
                    this.url = "";
                    this.comment = "";
                    this.icon = {};
                },
                //заполнение полей по переданному объекту
                fillByObject: function (source) {
                    this.id = source.id;
                    this.name = source.name;
                    this.url = source.url;
                    this.comment = source.comment;
                    this.icon = source.icon;
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

                    source.save(_this)
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

                    notifyService.confirmDelete("Удалить источник " + _this.name + "?", function () {

                        notifyService.showLoadBar();

                        source.delete(_this)
                            .then(function () {
                                notifyService.notify("Источник " + _this.name + " удален");
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
