/*
 *  Document   : app.js
 */

// Create our angular module
var App = angular.module('app', [
    'ngStorage',
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'oc.lazyLoad',
    'mocoAuth'
]);

// Router configuration
App
    .constant('config', {
        apiUrl: 'http://api.moco-moco',
        siteUrl: 'http://moco-moco',
        appName: 'Money Control',
        appFullName: 'MOCO - Money Control',
        version: '1.0.0'
    })
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/dashboard');

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'assets/views/auth/page_login.html',
                    pageTitle: 'Вход',
                    onlyGuests: true
                })
                .state('signup', {
                    url: '/signup',
                    templateUrl: 'assets/views/auth/page_signup.html',
                    pageTitle: 'Регистрация',
                    onlyGuests: true
                })
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: 'assets/views/page_tag_index.html',
                    controller: 'DashboardCtrl',
                    //resolve: {
                    //    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    //        return $ocLazyLoad.load({
                    //            insertBefore: '#css-bootstrap',
                    //            serie: true,
                    //            files: [
                    //                'assets/js/plugins/slick/slick.min.css',
                    //                'assets/js/plugins/slick/slick-theme.min.css',
                    //                'assets/js/plugins/slick/slick.min.js',
                    //                'assets/js/plugins/chartjs/Chart.min.js'
                    //            ]
                    //        });
                    //    }]
                    //},
                    pageTitle: 'Панель управления',
                    requireLogin: true
                })
                .state('transactions', {
                    url: '/transactions',
                    templateUrl: 'assets/views/page_in_developing.html',
                    controller: 'TransactionsCtrl',
                    pageTitle: 'Операции',
                    requireLogin: true
                })
                .state('templates', {
                    url: '/templates',
                    templateUrl: 'assets/views/page_in_developing.html',
                    controller: 'TemplatesCtrl',
                    pageTitle: 'Шаблоны',
                    requireLogin: true
                });
        }
    ])
    .factory('httpInterceptor', ['$q', '$rootScope', 'uiHelpers', function ($q, $rootScope, uiHelpers) {

        return {
            request: function (request) {
                return request;
            },
            responseError: function (response) {
                // 401 handled in authInterceptor service
                // 422 handled in controllers
                if (response.status !== 401 && response.status !== 422) {
                    var message = response.data.message || response.statusText;
                    uiHelpers.uiNotify('error', message);
                }
                return $q.reject(response);
            }
        };
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]);

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
        },
        // Handles page loader functionality
        uiNotify: function (type, message) {

            var icon = 'fa fa-bell';

            switch (type) {
                case 'error':
                    icon = 'fa fa-close';
                    break;
                case 'warning':
                    icon = 'fa fa-warning';
                    break;
                case 'success':
                    icon = 'fa fa-check';
                    break;
                default:
                    type = 'info';
            }

            Lobibox.notify(type, {
                msg: message,
                size: 'mini',
                sound: false,
                icon: icon,
                delay: 7000
            });
        }
    };
});

// Run our App
App.run(['$rootScope', '$state', 'uiHelpers', 'config', 'auth', function ($rootScope, $state, uiHelpers, config, auth) {

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

    $rootScope.config = config;

    $rootScope.$on('$stateChangeStart', function (event, toState) {

        var requireLogin = toState.requireLogin;
        var onlyGuests = toState.onlyGuests;

        if (requireLogin && !auth.isAuthenticated()) {
            event.preventDefault();
            $state.go('login');
        } else if (onlyGuests && auth.isAuthenticated()) {
            event.preventDefault();
            $state.go('dashboard');
        }
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        $rootScope.pageTitle = toState.pageTitle ? toState.pageTitle : $rootScope.config.appName;
    });

}]);

// Application Main Controller
App.controller('AppCtrl', ['$scope', '$localStorage',
    function ($scope, $localStorage) {

        // App Settings
        $scope.config.settings = {
            sidebarLeft: true, // true: Left Sidebar and right Side Overlay, false: Right Sidebar and left Side Overlay
            sidebarOpen: true, // Visible Sidebar by default (> 991px)
            sidebarOpenXs: false, // Visible Sidebar by default (< 992px)
            sidebarMini: false, // Mini hoverable Sidebar (> 991px)
            sideOverlayOpen: false, // Visible Side Overlay by default (> 991px)
            sideScroll: true, // Enables custom scrolling on Sidebar and Side Overlay instead of native scrolling (> 991px)
            headerFixed: true // Enables fixed header
        };

        // If settings defined in local storage load them? if not - add default to LS
        if (angular.isDefined($localStorage.settings)) {
            $scope.config.settings = $localStorage.settings;
        } else {
            $localStorage.settings = $scope.config.settings;
        }

        // Watch for settings changes
        $scope.$watch('$rootScope.config.settings', function () {
            // If settings are changed then save them to localstorage
            $localStorage.settings = $scope.config.settings;
        }, true);

        // Watch for sideScroll variable update
        $scope.$watch('$rootScope.config.settings.sideScroll', function () {
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
App.controller('HeaderCtrl', ['$scope',
    function ($scope) {
        // When view content is loaded
        $scope.$on('$includeContentLoaded', function () {
            // Transparent header functionality
            $scope.helpers.uiHandleHeader();
        });
    }
]);