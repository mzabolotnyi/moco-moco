/*
 *  Document   : directives.js
 *  Author     : pixelcave
 *  Description: Our custom directives
 *
 */

/*
 * Custom helper directives
 *
 */

// View loader functionality
// By adding the attribute 'data-js-view-loader'
App.directive('jsViewLoader', function () {
    return {
        link: function (scope, element) {
            var el = jQuery(element);

            // Hide the view loader, populate it with content and style it
            el
                .hide()
                .html('<image src="assets/img/loaders/circle.gif" width="34px" height="34px"></image>')
                .css({
                    'position': 'relative',
                    'z-index': 99999
                });

            // On state change start event, show the element
            scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                el.fadeIn(250);
            });

            // On state change success event, hide the element
            scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                el.fadeOut(250);
            });
        }
    };
});

// Main navigation functionality
// By adding the attribute 'data-js-main-nav'
App.directive('jsMainNav', function () {
    return {
        link: function (scope, element) {
            // When a submenu link is clicked
            jQuery('[data-toggle="nav-submenu"]', element).on('click', function (e) {
                // Get link
                var link = jQuery(this);

                // Get link's parent
                var parentLi = link.parent('li');

                if (parentLi.hasClass('open')) { // If submenu is open, close it..
                    parentLi.removeClass('open');
                } else { // .. else if submenu is closed, close all other (same level) submenus first before open it
                    link
                        .closest('ul')
                        .find('> li')
                        .removeClass('open');

                    parentLi
                        .addClass('open');
                }

                return false;
            });

            // Remove focus when clicking on a link
            jQuery('a', element).on('click', function () {
                jQuery(this).blur();
            });

            // On state change success event, hide the sidebar in mobile devices
            scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                scope.moco.settings.sidebarOpenXs = false;
            });
        }
    };
});

// Form helper functionality (placeholder support for IE9 which uses HTML5 Placeholder plugin + Material forms)
// Auto applied to all your form elements (<form>)
App.directive('form', function () {
    return {
        restrict: 'E',
        link: function (scope, element) {
            // Init form placeholder (for IE9)
            jQuery('.form-control', element).placeholder();

            // Init material forms
            jQuery('.form-material.floating > .form-control', element).each(function () {
                var input = jQuery(this);
                var parent = input.parent('.form-material');

                if (input.val()) {
                    parent.addClass('open');
                }

                input.on('change', function () {
                    if (input.val()) {
                        parent.addClass('open');
                    } else {
                        parent.removeClass('open');
                    }
                });
            });
        }
    };
});

// Blocks options functionality
// By adding the attribute 'data-js-block-option'
App.directive('jsBlockOption', function () {
    return {
        link: function (scope, element) {
            var el = jQuery(element);

            // Init Icons
            scope.helpers.uiBlocks(false, 'init', el);

            // Call blocks API on click
            el.on('click', function () {
                scope.helpers.uiBlocks(el.closest('.block'), el.data('action'));
            });
        }
    };
});

// Print page on click
// By adding the attribute 'data-js-print'
App.directive('jsPrint', function () {
    return {
        link: function (scope, element) {
            jQuery(element).on('click', function () {
                // Store all #page-container classes
                var lPage = jQuery('#page-container');
                var pageCls = lPage.prop('class');

                // Remove all classes from #page-container
                lPage.prop('class', '');

                // Print the page
                window.print();

                // Restore all #page-container classes
                lPage.prop('class', pageCls);
            });
        }
    };
});

// Populate element's content with the correct copyright year
// By adding the attribute 'data-js-year-copy'
App.directive('jsYearCopy', function () {
    return {
        link: function (scope, element) {
            var gdate = new Date();
            var copyright = '2015';

            if (gdate.getFullYear() !== 2015) {
                copyright = copyright + '-' + gdate.getFullYear().toString().substr(2, 2);
            }

            element.text(copyright);
        }
    };
});

// Animated scroll to an element
// By adding the attribute (with custom values) 'data-js-scroll-to="{target: '#target_element_id', speed: 'milliseconds'}"' to a button or a link
App.directive('jsScrollTo', function () {
    return {
        link: function (scope, element, attrs) {
            var options = (typeof scope.$eval(attrs.jsScrollTo) !== 'undefined') ? scope.$eval(attrs.jsScrollTo) : new Object();

            jQuery(element).on('click', function () {
                jQuery('html, body').animate({
                    scrollTop: jQuery(options.target).offset().top
                }, options.speed ? options.speed : 1000);
            });
        }
    };
});

// Toggle a class to a target element
// By adding the attribute (with custom values) 'data-js-toggle-class="{target: '#target_element_id', class: 'class_name_to_toggle'}'
App.directive('jsToggleClass', function () {
    return {
        link: function (scope, element, attrs) {
            var options = (typeof scope.$eval(attrs.jsToggleClass) !== 'undefined') ? scope.$eval(attrs.jsToggleClass) : new Object();

            jQuery(element).on('click', function () {
                jQuery(options.target).toggleClass(options.class);
            });
        }
    };
});

// Removes focus from an element on click
// By adding the attribute 'data-js-blur'
App.directive('jsBlur', function () {
    return {
        link: function (scope, element) {
            element.bind('click', function () {
                element.blur();
            });
        }
    };
});


/*
 * Third party jQuery plugin inits or custom ui helpers packed in Angular directives for easy
 *
 */

// Bootstrap Tabs (legacy init - if you like, you can use the native implementation from Angular UI Bootstrap)
// By adding the attribute 'data-js-tabs' to a ul with Bootstrap tabs markup
App.directive('jsTabs', function () {
    return {
        link: function (scope, element) {
            jQuery('a', element).on('click', function (e) {
                e.preventDefault();
                jQuery(this).tab('show');
            });
        }
    };
});

// Custom Table functionality: Section toggling
// By adding the attribute 'data-js-table-sections' to your table
App.directive('jsTableSections', function () {
    return {
        link: function (scope, element) {
            var table = jQuery(element);
            var tableRows = jQuery('.js-table-sections-header > tr', table);

            tableRows.on('click', function (e) {
                var row = jQuery(this);
                var tbody = row.parent('tbody');

                if (!tbody.hasClass('open')) {
                    jQuery('tbody', table).removeClass('open');
                }

                tbody.toggleClass('open');
            });
        }
    };
});

// Custom Table functionality: Checkable rows
// By adding the attribute 'data-js-table-checkable' to your table
App.directive('jsTableCheckable', function () {
    return {
        link: function (scope, element) {
            var table = jQuery(element);

            // When a checkbox is clicked in thead
            jQuery('thead input:checkbox', table).click(function () {
                var checkedStatus = jQuery(this).prop('checked');

                // Check or uncheck all checkboxes in tbody
                jQuery('tbody input:checkbox', table).each(function () {
                    var checkbox = jQuery(this);

                    checkbox.prop('checked', checkedStatus);
                    uiCheckRow(checkbox, checkedStatus);
                });
            });

            // When a checkbox is clicked in tbody
            jQuery('tbody input:checkbox', table).click(function () {
                var checkbox = jQuery(this);

                uiCheckRow(checkbox, checkbox.prop('checked'));
            });

            // When a row is clicked in tbody
            jQuery('tbody > tr', table).click(function (e) {
                if (e.target.type !== 'checkbox'
                    && e.target.type !== 'button'
                    && e.target.tagName.toLowerCase() !== 'a'
                    && !jQuery(e.target).parent('label').length) {
                    var checkbox = jQuery('input:checkbox', this);
                    var checkedStatus = checkbox.prop('checked');

                    checkbox.prop('checked', !checkedStatus);
                    uiCheckRow(checkbox, !checkedStatus);
                }
            });

            // Checkable table functionality helper - Checks or unchecks table row
            var uiCheckRow = function (checkbox, checkedStatus) {
                if (checkedStatus) {
                    checkbox
                        .closest('tr')
                        .addClass('active');
                } else {
                    checkbox
                        .closest('tr')
                        .removeClass('active');
                }
            };
        }
    };
});

// jQuery Appear, for more examples you can check out https://github.com/bas2k/jquery.appear
// By adding the attribute (with custom values) 'data-js-appear="{speed: 1000, refreshInterval: 10, ...}'
App.directive('jsAppear', function () {
    return {
        link: function (scope, element, attrs) {
            var options = (typeof scope.$eval(attrs.jsAppear) !== 'undefined') ? scope.$eval(attrs.jsAppear) : new Object();
            var el = jQuery(element);
            var windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            el.appear(function () {
                setTimeout(function () {
                    el.removeClass('visibility-hidden')
                        .addClass(options.class ? options.class : 'animated fadeIn');
                }, (jQuery('html').hasClass('ie9') || windowW < 992) ? 0 : (options.timeout ? options.timeout : 0));
            }, {accY: options.offset ? options.offset : 0});
        }
    };
});

// jQuery Appear + jQuery countTo, for more examples you can check out https://github.com/bas2k/jquery.appear and https://github.com/mhuggins/jquery-countTo
// By adding the attribute (with custom values) 'data-js-count-to="{speed: 1000, refreshInterval: 10, ...}'
App.directive('jsCountTo', function () {
    return {
        link: function (scope, element, attrs) {
            var options = (typeof scope.$eval(attrs.jsCountTo) !== 'undefined') ? scope.$eval(attrs.jsCountTo) : new Object();
            var el = jQuery(element);

            el.appear(function () {
                el.countTo({
                    speed: options.speed ? options.speed : 1500,
                    refreshInterval: options.refreshInterval ? options.refreshInterval : 15,
                    onComplete: function () {
                        if (options.after) {
                            el.html(el.html() + options.after);
                        }
                    }
                });
            });
        }
    };
});

// SlimScroll, for more examples you can check out http://rocha.la/jQuery-slimScroll
// By adding the attribute (with custom values) 'data-js-slimscroll="{height: '100px', size: '3px', ...}'
App.directive('jsSlimscroll', function () {
    return {
        link: function (scope, element, attrs) {
            var options = (typeof scope.$eval(attrs.jsSlimscroll) !== 'undefined') ? scope.$eval(attrs.jsSlimscroll) : new Object();

            jQuery(element).slimScroll({
                height: options.height ? options.height : '200px',
                size: options.size ? options.size : '5px',
                position: options.position ? options.position : 'right',
                color: options.color ? options.color : '#000',
                alwaysVisible: options.alwaysVisible ? true : false,
                railVisible: options.railVisible ? true : false,
                railColor: options.railColor ? options.railColor : '#999',
                railOpacity: options.railOpacity ? options.railOpacity : .3
            });
        }
    };
});

/*
 ********************************************************************************************
 *
 * All the following directives require each plugin's resources (JS, CSS) to be lazy loaded in
 * the page in order to work, so please make sure you've included them in your route configuration
 *
 ********************************************************************************************
 */

// Bootstrap Datepicker, for more examples you can check out https://github.com/eternicode/bootstrap-datepicker
// By adding the attribute 'data-js-datepicker'
App.directive('jsDatepicker', function () {
    return {
        link: function (scope, element) {
            jQuery(element).datepicker({
                weekStart: 1,
                autoclose: true,
                todayHighlight: true
            });
        }
    };
});

// Directive for updating page title based on current app state
App.directive('jsUpdateTitle', function ($rootScope, $timeout) {
    return {
        link: function () {

            var listener = function (event, toState) {

                $timeout(function () {
                    $rootScope.pageTitle = toState.pageTitle ? toState.pageTitle : $rootScope.appName;
                });
            };

            $rootScope.$on('$stateChangeSuccess', listener);
        }
    };
});