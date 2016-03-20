/*
 *  Document   : app.js
 *  Author     : pixelcave
 *  Description: Setting up and vital functionality for our App
 *
 */

// Create our angular module
var App = angular.module('app', [
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'oc.lazyLoad'
]);

// Router configuration
App.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'assets/views/page_login.html',
                controller: 'LoginCtrl',
                pageTitle: 'Вход',
                onlyGuests: true
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'assets/views/page_in_developing.html',
                controller: 'DashboardCtrl',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            insertBefore: '#css-bootstrap',
                            serie: true,
                            files: [
                                'assets/js/plugins/slick/slick.min.css',
                                'assets/js/plugins/slick/slick-theme.min.css',
                                'assets/js/plugins/slick/slick.min.js',
                                'assets/js/plugins/chartjs/Chart.min.js'
                            ]
                        });
                    }]
                },
                pageTitle: 'Панель управления',
                requireLogin: true
            })
            .state('transactions', {
                url: '/transactions',
                templateUrl: 'assets/views/page_tag_index.html',
                controller: 'TransactionsCtrl',
                pageTitle: 'Операции',
                requireLogin: true
            })
            .state('templates', {
                url: '/transactions/templates',
                templateUrl: 'assets/views/page_in_developing.html',
                controller: 'TemplatesCtrl',
                pageTitle: 'Шаблоны',
                requireLogin: true
            });

        $httpProvider.interceptors.push('authInterceptor');
    }
]);

// Tooltips and Popovers configuration
App.config(['$uibTooltipProvider',
    function ($uibTooltipProvider) {
        $uibTooltipProvider.options({
            appendToBody: true
        });
    }
]);

// Custom UI helper functions
App.factory('uiHelpers', function () {
    return {
        // Handles #main-container height resize to push footer to the bottom of the page
        uiHandleMain: function () {
            var lMain = jQuery('#main-container');
            var hWindow = jQuery(window).height();
            var hHeader = jQuery('#header-navbar').outerHeight();
            var hFooter = jQuery('#page-footer').outerHeight();

            if (jQuery('#page-container').hasClass('header-navbar-fixed')) {
                lMain.css('min-height', hWindow - hFooter);
            } else {
                lMain.css('min-height', hWindow - (hHeader + hFooter));
            }
        },
        // Handles transparent header functionality (solid on scroll - used in frontend pages)
        uiHandleHeader: function () {
            var lPage = jQuery('#page-container');

            if (lPage.hasClass('header-navbar-fixed') && lPage.hasClass('header-navbar-transparent')) {
                jQuery(window).on('scroll', function () {
                    if (jQuery(this).scrollTop() > 20) {
                        lPage.addClass('header-navbar-scroll');
                    } else {
                        lPage.removeClass('header-navbar-scroll');
                    }
                });
            }
        },
        // Handles sidebar and side overlay custom scrolling functionality
        uiHandleScroll: function (mode) {
            var windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var lPage = jQuery('#page-container');
            var lSidebar = jQuery('#sidebar');
            var lSidebarScroll = jQuery('#sidebar-scroll');
            var lSideOverlay = jQuery('#side-overlay');
            var lSideOverlayScroll = jQuery('#side-overlay-scroll');

            // Init scrolling
            if (mode === 'init') {
                // Init scrolling only if required the first time
                uiHandleScroll();
            } else {
                // If screen width is greater than 991 pixels and .side-scroll is added to #page-container
                if (windowW > 991 && lPage.hasClass('side-scroll') && (lSidebar.length || lSideOverlay.length)) {
                    // If sidebar exists
                    if (lSidebar.length) {
                        // Turn sidebar's scroll lock off (slimScroll will take care of it)
                        jQuery(lSidebar).scrollLock('off');

                        // If sidebar scrolling does not exist init it..
                        if (lSidebarScroll.length && (!lSidebarScroll.parent('.slimScrollDiv').length)) {
                            lSidebarScroll.slimScroll({
                                height: lSidebar.outerHeight(),
                                color: '#fff',
                                size: '5px',
                                opacity: .35,
                                wheelStep: 15,
                                distance: '2px',
                                railVisible: false,
                                railOpacity: 1
                            });
                        }
                        else { // ..else resize scrolling height
                            lSidebarScroll
                                .add(lSidebarScroll.parent())
                                .css('height', lSidebar.outerHeight());
                        }
                    }

                    // If side overlay exists
                    if (lSideOverlay.length) {
                        // Turn side overlay's scroll lock off (slimScroll will take care of it)
                        jQuery(lSideOverlay).scrollLock('off');

                        // If side overlay scrolling does not exist init it..
                        if (lSideOverlayScroll.length && (!lSideOverlayScroll.parent('.slimScrollDiv').length)) {
                            lSideOverlayScroll.slimScroll({
                                height: lSideOverlay.outerHeight(),
                                color: '#000',
                                size: '5px',
                                opacity: .35,
                                wheelStep: 15,
                                distance: '2px',
                                railVisible: false,
                                railOpacity: 1
                            });
                        }
                        else { // ..else resize scrolling height
                            lSideOverlayScroll
                                .add(lSideOverlayScroll.parent())
                                .css('height', lSideOverlay.outerHeight());
                        }
                    }
                } else {
                    // If sidebar exists
                    if (lSidebar.length) {
                        // If sidebar scrolling exists destroy it..
                        if (lSidebarScroll.length && lSidebarScroll.parent('.slimScrollDiv').length) {
                            lSidebarScroll
                                .slimScroll({destroy: true});
                            lSidebarScroll
                                .attr('style', '');
                        }

                        // Turn sidebars's scroll lock on
                        jQuery(lSidebar).scrollLock();
                    }

                    // If side overlay exists
                    if (lSideOverlay.length) {
                        // If side overlay scrolling exists destroy it..
                        if (lSideOverlayScroll.length && lSideOverlayScroll.parent('.slimScrollDiv').length) {
                            lSideOverlayScroll
                                .slimScroll({destroy: true});
                            lSideOverlayScroll
                                .attr('style', '');
                        }

                        // Turn side overlay's scroll lock on
                        jQuery(lSideOverlay).scrollLock();
                    }
                }
            }
        },
        // Handles page loader functionality
        uiLoader: function (mode) {
            var lBody = jQuery('body');
            var lpageLoader = jQuery('#page-loader');

            if (mode === 'show') {
                if (lpageLoader.length) {
                    lpageLoader.fadeIn(250);
                } else {
                    lBody.prepend('<div id="page-loader"></div>');
                }
            } else if (mode === 'hide') {
                if (lpageLoader.length) {
                    lpageLoader.fadeOut(250);
                }
            }
        },
        // Handles blocks API functionality
        uiBlocks: function (block, mode, button) {
            // Set default icons for fullscreen and content toggle buttons
            var iconFullscreen = 'si si-size-fullscreen';
            var iconFullscreenActive = 'si si-size-actual';
            var iconContent = 'si si-arrow-up';
            var iconContentActive = 'si si-arrow-down';

            if (mode === 'init') {
                // Auto add the default toggle icons
                switch (button.data('action')) {
                    case 'fullscreen_toggle':
                        button.html('<i class="' + (button.closest('.block').hasClass('block-opt-fullscreen') ? iconFullscreenActive : iconFullscreen) + '"></i>');
                        break;
                    case 'content_toggle':
                        button.html('<i class="' + (button.closest('.block').hasClass('block-opt-hidden') ? iconContentActive : iconContent) + '"></i>');
                        break;
                    default:
                        return false;
                }
            } else {
                // Get block element
                var elBlock = (block instanceof jQuery) ? block : jQuery(block);

                // If element exists, procceed with blocks functionality
                if (elBlock.length) {
                    // Get block option buttons if exist (need them to update their icons)
                    var btnFullscreen = jQuery('[data-js-block-option][data-action="fullscreen_toggle"]', elBlock);
                    var btnToggle = jQuery('[data-js-block-option][data-action="content_toggle"]', elBlock);

                    // Mode selection
                    switch (mode) {
                        case 'fullscreen_toggle':
                            elBlock.toggleClass('block-opt-fullscreen');

                            // Enable/disable scroll lock to block
                            elBlock.hasClass('block-opt-fullscreen') ? jQuery(elBlock).scrollLock() : jQuery(elBlock).scrollLock('off');

                            // Update block option icon
                            if (btnFullscreen.length) {
                                if (elBlock.hasClass('block-opt-fullscreen')) {
                                    jQuery('i', btnFullscreen)
                                        .removeClass(iconFullscreen)
                                        .addClass(iconFullscreenActive);
                                } else {
                                    jQuery('i', btnFullscreen)
                                        .removeClass(iconFullscreenActive)
                                        .addClass(iconFullscreen);
                                }
                            }
                            break;
                        case 'fullscreen_on':
                            elBlock.addClass('block-opt-fullscreen');

                            // Enable scroll lock to block
                            jQuery(elBlock).scrollLock();

                            // Update block option icon
                            if (btnFullscreen.length) {
                                jQuery('i', btnFullscreen)
                                    .removeClass(iconFullscreen)
                                    .addClass(iconFullscreenActive);
                            }
                            break;
                        case 'fullscreen_off':
                            elBlock.removeClass('block-opt-fullscreen');

                            // Disable scroll lock to block
                            jQuery(elBlock).scrollLock('off');

                            // Update block option icon
                            if (btnFullscreen.length) {
                                jQuery('i', btnFullscreen)
                                    .removeClass(iconFullscreenActive)
                                    .addClass(iconFullscreen);
                            }
                            break;
                        case 'content_toggle':
                            elBlock.toggleClass('block-opt-hidden');

                            // Update block option icon
                            if (btnToggle.length) {
                                if (elBlock.hasClass('block-opt-hidden')) {
                                    jQuery('i', btnToggle)
                                        .removeClass(iconContent)
                                        .addClass(iconContentActive);
                                } else {
                                    jQuery('i', btnToggle)
                                        .removeClass(iconContentActive)
                                        .addClass(iconContent);
                                }
                            }
                            break;
                        case 'content_hide':
                            elBlock.addClass('block-opt-hidden');

                            // Update block option icon
                            if (btnToggle.length) {
                                jQuery('i', btnToggle)
                                    .removeClass(iconContent)
                                    .addClass(iconContentActive);
                            }
                            break;
                        case 'content_show':
                            elBlock.removeClass('block-opt-hidden');

                            // Update block option icon
                            if (btnToggle.length) {
                                jQuery('i', btnToggle)
                                    .removeClass(iconContentActive)
                                    .addClass(iconContent);
                            }
                            break;
                        case 'refresh_toggle':
                            elBlock.toggleClass('block-opt-refresh');

                            // Return block to normal state if the demostration mode is on in the refresh option button - data-action-mode="demo"
                            if (jQuery('[data-js-block-option][data-action="refresh_toggle"][data-action-mode="demo"]', elBlock).length) {
                                setTimeout(function () {
                                    elBlock.removeClass('block-opt-refresh');
                                }, 2000);
                            }
                            break;
                        case 'state_loading':
                            elBlock.addClass('block-opt-refresh');
                            break;
                        case 'state_normal':
                            elBlock.removeClass('block-opt-refresh');
                            break;
                        case 'close':
                            elBlock.hide();
                            break;
                        case 'open':
                            elBlock.show();
                            break;
                        default:
                            return false;
                    }
                }
            }
        }
    };
});

// Interceptor will add the access token to the users requests if the user is logged in.
// And redirect to the login form in case of a “401 Unauthorized” HTTP status.
App.factory('authInterceptor', function ($timeout, $q, $injector, $rootScope, $localStorage) {

    var $state, Auth;

    // this trick must be done so that we don't receive
    // `Uncaught Error: [$injector:cdep] Circular dependency found`
    $timeout(function () {
        $state = $injector.get('$state');
        Auth = $injector.get('Auth');
    });

    return {
        request: function (config) {
            if (config.url.indexOf($rootScope.apiUrl) > -1) {
                if (angular.isDefined($localStorage.token)) {
                    config.headers.Authorization = 'Bearer ' + $localStorage.token;
                }
            }

            return config;
        },
        responseError: function (rejection) {
            if (rejection.status !== 401) {
                return $q.reject(rejection);
            }
            delete $localStorage.token;
            $state.go('login');
        }
    };
});

// Auth service
App.factory('Auth', function ($http, $rootScope, $localStorage) {

    return {
        isLoggedIn: function () {
            return angular.isDefined(this.getToken())
                && typeof(this.getToken()) === 'string'
                && this.getToken() !== '';
        },
        register: function (user, success, error) {
            $http.post('/register', user).success(success).error(error);
        },
        login: function (user) {
            return $http.post($rootScope.apiUrl + '/auth', user);
        },
        logout: function (success, error) {
            $http.post('/logout').success(function () {
                $rootScope.user = {
                    //username = '',
                    //role = userRoles.public
                };
                success();
            }).error(error);
        },
        setToken: function (token) {
            $localStorage.token = token;
        },
        getToken: function () {
            return $localStorage.token;
        },
        removeToken: function () {
            delete $localStorage.token
        }
    };
});

// Run our App
App.run(function ($rootScope, $state, uiHelpers, Auth) {
    // Access uiHelpers easily from all controllers
    $rootScope.helpers = uiHelpers;

    // On window resize or orientation change resize #main-container & Handle scrolling
    var resizeTimeout;

    jQuery(window).on('resize orientationchange', function () {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(function () {
            $rootScope.helpers.uiHandleScroll();
            $rootScope.helpers.uiHandleMain();
        }, 150);
    });

    $rootScope.appName = 'Money Control';
    $rootScope.appFullName = 'MOCO - Money Control';
    $rootScope.version = '1.0.0';
    $rootScope.baseUrl = 'http://moco-moco';
    $rootScope.apiUrl = 'http://api.moco-moco';

    $rootScope.$on('$stateChangeStart', function (event, toState) {

        var requireLogin = toState.requireLogin;
        var onlyGuests = toState.onlyGuests;

        if (requireLogin && !Auth.isLoggedIn()) {
            event.preventDefault();
            $state.go('login');
        } else if (onlyGuests && Auth.isLoggedIn()) {
            event.preventDefault();
            $state.go('dashboard');
        }
    });

});

// Application Main Controller
App.controller('AppCtrl', ['$scope', '$localStorage', 'Auth',
    function ($scope, $localStorage, Auth) {
        // App Settings
        $scope.moco = {
            version: '1.0.0', // App version
            baseUrl: 'http://moco-moco/', // App URL
            apiUrl: 'http://api.moco-moco/', // App URL
            localStorage: true, // Enable/Disable local storage
            settings: {
                sidebarLeft: true, // true: Left Sidebar and right Side Overlay, false: Right Sidebar and left Side Overlay
                sidebarOpen: true, // Visible Sidebar by default (> 991px)
                sidebarOpenXs: false, // Visible Sidebar by default (< 992px)
                sidebarMini: false, // Mini hoverable Sidebar (> 991px)
                sideOverlayOpen: false, // Visible Side Overlay by default (> 991px)
                sideScroll: true, // Enables custom scrolling on Sidebar and Side Overlay instead of native scrolling (> 991px)
                headerFixed: true // Enables fixed header
            },
            isAuthorized: function () {
                return Auth.isLoggedIn();
            }
        };

        // If local storage setting is enabled
        if ($scope.moco.localStorage) {
            // Save/Restore local storage settings
            if ($scope.moco.localStorage) {
                if (angular.isDefined($localStorage.mocoSettings)) {
                    $scope.moco.settings = $localStorage.mocoSettings;
                } else {
                    $localStorage.mocoSettings = $scope.moco.settings;
                }
            }

            // Watch for settings changes
            $scope.$watch('moco.settings', function () {
                // If settings are changed then save them to localstorage
                $localStorage.mocoSettings = $scope.moco.settings;
            }, true);
        }

        // Watch for sideScroll variable update
        $scope.$watch('moco.settings.sideScroll', function () {
            // Handle Scrolling
            setTimeout(function () {
                $scope.helpers.uiHandleScroll();
            }, 150);
        }, true);

        // When view content is loaded
        $scope.$on('$viewContentLoaded', function () {
            // Hide page loader
            $scope.helpers.uiLoader('hide');

            // Resize #main-container
            $scope.helpers.uiHandleMain();
        });
    }
]);

// Side Overlay Controller
App.controller('SideOverlayCtrl', ['$scope', '$localStorage', '$window',
    function ($scope, $localStorage, $window) {
        // When view content is loaded
        $scope.$on('$includeContentLoaded', function () {
            // Handle Scrolling
            $scope.helpers.uiHandleScroll();
        });
    }
]);

// Sidebar Controller
App.controller('SidebarCtrl', ['$scope', '$localStorage', '$window', '$location',
    function ($scope, $localStorage, $window, $location) {
        // When view content is loaded
        $scope.$on('$includeContentLoaded', function () {
            // Handle Scrolling
            $scope.helpers.uiHandleScroll();

            // Get current path to use it for adding active classes to our submenus
            $scope.path = $location.path();
        });
    }
]);

// Header Controller
App.controller('HeaderCtrl', ['$scope', '$localStorage', '$window',
    function ($scope, $localStorage, $window) {
        // When view content is loaded
        $scope.$on('$includeContentLoaded', function () {
            // Transparent header functionality
            $scope.helpers.uiHandleHeader();
        });
    }
]);