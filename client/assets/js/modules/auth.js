// Create new angular module
var AuthModule = angular.module('mocoAuth', [
    'ngStorage'
]);

// Defining logic
AuthModule
    .constant('authConfig', {
        loginUrl: 'auth/login',
        signupUrl: 'auth/signup',
        logoutUrl: 'auth/logout',
        changePasswordUrl: 'auth/change-password',
        requestAccessRecoveryUrl: 'auth/request-access-recovery',
        accessRecoveryUrl: 'auth/access-recovery',
        tokenName: 'access-token'
    })
    .factory('authUtils', ['$localStorage', 'authConfig', 'config', function ($localStorage, config, appConfig) {
        return {
            getFullUrl: function (path) {
                return [appConfig.apiUrl, path].join('/')
            },
            isAuthenticated: function () {
                var token = this.getToken();
                return angular.isDefined(token)
                    && typeof(token) === 'string'
                    && token !== '';
            },
            setToken: function (token) {
                $localStorage[config.tokenName] = token;
                alert('Set token ' + token);
            },
            getToken: function () {
                alert('Get token ' + $localStorage[config.tokenName]);
                return $localStorage[config.tokenName];
            },
            removeToken: function () {
                delete $localStorage[config.tokenName];
                alert('Remove token');
            }
        }
    }])
    .factory('auth', ['$http', 'authConfig', 'authUtils', function ($http, config, utils) {
        return {
            login: function (user) {
                return $http.post(utils.getFullUrl(config.loginUrl), user)
                    .success(function (response) {
                        utils.setToken(response.token);
                    });
            },
            signup: function (user) {
                return $http.post(utils.getFullUrl(config.signupUrl), user)
                    .success(function (response) {
                        utils.setToken(response.token);
                    });
            },
            logout: function (user) {
                return $http.post(utils.getFullUrl(config.logoutUrl), user)
                    .finally(function () {
                        utils.removeToken();
                    });
            },
            changePassword: function (data) {
                return $http.post(utils.getFullUrl(config.changePasswordUrl), data);
            },
            requestAccessRecovery: function (data) {
                return $http.post(utils.getFullUrl(config.requestAccessRecoveryUrl), data);
            },
            accessRecovery: function (data) {
                return $http.post(utils.getFullUrl(config.accessRecoveryUrl), data);
            },
            isAuthenticated: function () {
                return utils.isAuthenticated();
            },
            setToken: function (token) {
                utils.setToken(token);
            },
            getToken: function () {
                return utils.getToken();
            },
            removeToken: function () {
                utils.removeToken();
            }
        };
    }])
    .factory('authInterceptor', ['$q', '$window', 'config', 'authUtils', function ($q, $window, appConfig, utils) {

        return {
            request: function (request) {
                if (request.url.indexOf(appConfig.apiUrl) > -1) {
                    if (utils.isAuthenticated()) {
                        request.headers.Authorization = 'Bearer ' + utils.getToken();
                    }
                }
                return request;
            },
            responseError: function (response) {
                if (response.status === 401) {
                    utils.removeToken();
                    $window.location.href = appConfig.authHref;
                } else {
                    return $q.reject(response);
                }
            }
        };
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }]);

// Defining controllers
AuthModule
    .controller('SignupCtrl', ['$scope', '$window', 'auth',
        function ($scope, $window, auth) {

            $scope.signup = function (user) {

                $scope.submitting = true;
                $scope.errors = {};

                auth.signup(user)
                    .then(function () {
                        $window.location.href = '/#/dashboard';
                    }, function (response) {
                        if (response.data) {
                            if (response.status === 422) {
                                $scope.errors = response.data;
                            } else {
                                $scope.errors = [response.data];
                            }
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };
        }
    ])
    .controller('LoginCtrl', ['$scope', '$window', 'auth',
        function ($scope, $window, auth) {

            $scope.login = function (user) {

                $scope.submitting = true;
                $scope.errors = {};

                auth.login(user)
                    .then(function () {
                        $window.location.href = '/#/dashboard';
                    }, function (response) {
                        if (response.data) {
                            if (response.status === 422) {
                                $scope.errors = response.data;
                            } else {
                                $scope.errors = [response.data];
                            }
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };

            $scope.loginDemo = function (){

                var user = {
                    email: 'demo@gmail.com',
                    password: 'demo'
                };

                this.login(user);
            };
        }
    ])
    .controller('LogoutCtrl', ['$scope', '$window', 'auth', 'config',
        function ($scope, $window, auth, appConfig) {

            $scope.logout = function () {
                auth.logout()
                    .then(function () {
                        $window.location.href = appConfig.authHref;
                    });
            };
        }
    ])
    .controller('ForgotPasswordCtrl', ['$scope', '$window', '$state', 'auth',
        function ($scope, $window, $state, auth) {

            $scope.isRequest = true;

            $scope.requestAccessRecovery = function (email) {

                $scope.submitting = true;
                $scope.errors = {};

                auth.requestAccessRecovery({email: email})
                    .then(function () {
                        $scope.isRequest = false;
                    }, function (response) {
                        if (response.data) {
                            if (response.status === 422) {
                                $scope.errors = response.data;
                            } else {
                                $scope.errors = [response.data];
                            }
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };

            $scope.accessRecovery = function (token) {

                $scope.submitting = true;
                $scope.errors = {};

                auth.accessRecovery({token: token})
                    .then(function () {
                        $window.alert("На Вашу почту был отправлен временный пароль, используйте его для входа");
                        $state.go('login');
                    }, function (response) {
                        if (response.data) {
                            if (response.status === 422) {
                                $scope.errors = response.data;
                            } else {
                                $scope.errors = [response.data];
                            }
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };
        }
    ])
    .controller('ChangePasswordCtrl', ['$scope', '$window', 'auth',
        function ($scope, $window, auth) {

            $scope.changePassword = function (data) {

                $scope.submitting = true;
                $scope.errors = {};

                auth.changePassword(data)
                    .then(function () {
                        $window.alert("Пароль был изменен");
                    }, function (response) {
                        if (response.data) {
                            if (response.status === 422) {
                                $scope.errors = response.data;
                            } else {
                                $scope.errors = [response.data];
                            }
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };
        }
    ]);