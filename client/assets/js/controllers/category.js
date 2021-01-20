App.controller('CategoriesCtrl', ['$scope', 'categories', 'category', 'notifyService',
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
                isActive: function (category) {
                    return category.id == this.category.id;
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
                    //заполнение полей по умолчанию (для новых)
                    fillDefault: function () {
                        this.id = 0;
                        this.name = "";
                        this.icon = "";
                        this.income = false;
                        this.expense = true;
                        this.active = true;
                        this.watch = false;
                        this.countTrans = 0;
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
                        this.watch = category.watch ? true : false;
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

            if (!$scope.global.isMobile()) {
                $scope.scope.edit($scope.scope.data[0]);
            }
        }]);
