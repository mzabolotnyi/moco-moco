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
            },
            getToken: function () {
                return $localStorage[config.tokenName];
            },
            removeToken: function () {
                delete $localStorage[config.tokenName];
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
                    .success(function () {
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
    }]).factory('authInterceptor', ['$q', '$injector', '$timeout', 'config', 'authUtils', function ($q, $injector, $timeout, appConfig, utils) {

        var state;

        $timeout(function () {
            state = $injector.get('$state');
        });

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
                    state.go('login');
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
    .controller('AuthCtrl', ['$scope', 'auth',
        function ($scope, auth) {
            $scope.isAuthenticated = function () {
                return auth.isAuthenticated();
            };
        }
    ])
    .controller('SignupCtrl', ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            $scope.signup = function (user) {
                $scope.submitting = true;
                $scope.errors = {};
                auth.signup(user)
                    .then(function () {
                        $state.go('dashboard');
                    }, function (response) {
                        if (response.status === 422 && response.data) {
                            $scope.errors = response.data;
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };
        }
    ])
    .controller('LoginCtrl', ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            $scope.login = function (user) {
                $scope.submitting = true;
                $scope.errors = {};
                auth.login(user)
                    .then(function () {
                        $state.go('dashboard');
                    }, function (response) {
                        if (response.status === 422 && response.data) {
                            $scope.errors = response.data;
                        }
                    })
                    .finally(function () {
                        $scope.submitting = false;
                    });
            };
        }
    ])
    .controller('LogoutCtrl', ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            $scope.logout = function () {
                auth.logout()
                    .then(function () {
                        $state.go('login');
                    });
            };
        }
    ]);