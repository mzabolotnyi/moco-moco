/*
 *  Document   : directives.js
 */

App

// Add swipe right event for mobile
    .directive('onSwipeRight', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('swiperight', function (event) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onSwipeRight)
                    });
                });
            }
        }
    })

    // Add swipe left event for mobile
    .directive('onSwipeLeft', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('swipeleft', function (event) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onSwipeLeft)
                    });
                });
            }
        }
    })

    // Add long press event for mobile
    .directive('onLongPress', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('touchstart', function (event) {
                    // Locally scoped variable that will keep track of the long press
                    scope.longPress = true;

                    // We'll set a timeout for 600 ms for a long press
                    $timeout(function () {
                        if (scope.longPress) {
                            // If the touchend event hasn't fired,
                            // apply the function given in on the element's on-long-press attribute
                            event.preventDefault();
                            scope.$apply(function () {
                                scope.$eval(attrs.onLongPress)
                            });
                        }
                    }, 600);
                });

                element.bind('touchmove', function (event) {
                    // Prevent the onLongPress event from firing
                    scope.longPress = false;
                });

                element.bind('touchend', function (event) {
                    // Prevent the onLongPress event from firing
                    scope.longPress = false;
                });
            }
        };
    })

    // Content editable
    .directive('contentEditable', function ($log, $sce, $compile, $window, $timeout) {
        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {ngModel: '=', editCallback: '&'},
            link: function (scope, elem, attrs, ngModel) {

                // return if ng model not specified
                if (!ngModel) {
                    $log.warn('Error: ngModel is required in elem: ', elem);
                    return;
                }

                var noEscape = true;
                var originalElement = elem[0];
                // get default usage options
                var options = {
                    editableClass: 'editable',
                    keyBindings: true, // default true for key shortcuts
                    singleLine: true,
                    focusSelect: true, // default on focus select all text inside
                    renderHtml: false,
                    editCallback: false,
                    editAutofocus: false
                };
                // update options with attributes
                angular.forEach(options, function (val, key) {
                    if (key in attrs && typeof attrs[key] !== 'undefined') {
                        options[key] = attrs[key];
                    }
                })

                // if model is invalid or null
                // fill his value with elem html content
                if (!scope.ngModel) {
                    ngModel.$setViewValue(elem.html());
                }

                // add editable class
                attrs.$addClass(options.editableClass);

                // render always with model value
                ngModel.$render = function () {
                    elem.html(ngModel.$modelValue || '');
                }

                // handle click on element
                function onClick(e) {
                    e.preventDefault();
                    attrs.$set('contenteditable', 'true');
                    return originalElement.focus();
                }

                // check some option extra
                // conditions during focus
                function onFocus(e) {
                    // turn on the flag
                    noEscape = true;
                    // select all on focus
                    if (options.focusSelect) {
                        var range = $window.document.createRange();
                        range.selectNodeContents(originalElement);
                        $window.getSelection().addRange(range);
                    }
                    // if render-html is enabled convert
                    // all text content to plaintext
                    // in order to modify html tags
                    if (options.renderHtml) {
                        originalElement.textContent = elem.html();
                    }
                }

                function onBlur(e) {

                    // the text
                    var html;

                    // disable editability
                    attrs.$set('contenteditable', 'false');

                    // if text needs to be rendered as html
                    if (options.renderHtml && noEscape) {
                        // get plain text html (with html tags)
                        // replace all blank spaces
                        html = originalElement.textContent.replace(/\u00a0/g, " ");
                        // update elem html value
                        elem.html(html);

                    } else {
                        // get element content replacing html tag
                        html = elem.html().replace(/&nbsp;/g, ' ');
                    }

                    // if element value is
                    // different from model value
                    if (html != ngModel.$modelValue) {

                        /**
                         * This method should be called
                         * when a controller wants to
                         * change the view value
                         */
                        ngModel.$setViewValue(html)
                    }

                    // if user passed a variable
                    // and is a function
                    if (scope.editCallback) {
                        // apply the callback
                        scope.$apply(function () {
                            scope.$eval(scope.editCallback)
                        });
                    }
                }

                function onKeyDown(e) {

                    // on tab key blur and
                    // TODO: focus to next
                    if (e.which == 9) {
                        originalElement.blur();
                        return;
                    }

                    // on esc key roll back value and blur
                    if (e.which == 27) {
                        ngModel.$rollbackViewValue();
                        noEscape = false;
                        return originalElement.blur();
                    }

                    // if single line or ctrl key is
                    // pressed trigger the blur event
                    if (e.which == 13 && (options.singleLine || e.ctrlKey)) {
                        return originalElement.blur();
                    }

                }

                /**
                 * On click turn the element
                 * to editable and focus it
                 */
                elem.bind('click', onClick);

                /**
                 * On element focus
                 */
                elem.bind('focus', onFocus);

                /**
                 * On element blur turn off
                 * editable mode, if HTML, render
                 * update model value and run callback
                 * if specified
                 */
                elem.bind('blur', onBlur);

                /**
                 * Bind the keydown event for many functions
                 * TODO: more to come
                 */
                elem.bind('keydown', onKeyDown);

                if (options.editAutofocus) {
                    $timeout(function () {
                        elem.click();
                    }, 100);
                }
            }
        }
    })

    // View loader functionality
    .directive('viewLoader', function () {
        return {
            templateUrl: function () {

                var template = 'assets/views/partials/loaders/loading-view.html';

                if ($('html').hasClass('ismobile')) {
                    template = 'assets/views/partials/loaders/loading-view-mobile.html';
                }

                return template;
            },
            link: function (scope, element) {

                // On state change start event, show the element if route has property "viewLoader"
                scope.$on('$stateChangeStart', function (event, toState) {
                    if (toState.viewLoader) {
                        $(element).fadeIn('fast');
                    }
                });

                // On state change success event, hide the element
                scope.$on('$stateChangeSuccess', function (event, toState) {
                    setTimeout(function () {
                        $(element).fadeOut('fast');
                    }, 500);
                });
            }
        };
    })

    // Directive for creating submit button with loading effect when submitting
    .directive('errorMessages', ['$compile', function ($compile) {
        return {
            link: function (scope, element) {

                // add if directive for inner content
                element.find('span')
                    .data('ng-if', '!submitting');

                // content when submitting
                var contentSubmitting = $('<span>');
                contentSubmitting.data('ng-if', 'submitting')
                    .html('<i class="fa fa-sun-o fa-spin"></i>');

                // complete submit button
                element.append(contentSubmitting)
                    .data('ng-disabled', 'form.$invalid||submitting')
                    .attr('type', 'submit');

                $compile(element)(scope);
            }
        };
    }])

    // Submenu toggle
    .directive('toggleSubmenu', function () {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    element.next().slideToggle(200);
                    element.parent().toggleClass('toggled');
                });
            }
        }
    })

    // Menu item on click must to close all opened submenus
    .directive('menuItem', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    var parentSubMenu = element.parent();
                    $('.main-menu .sub-menu > ul').not(parentSubMenu).slideUp(200);
                });
            }
        }
    })

    // Scroll on class 'c-overflow'
    .directive('cOverflow', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {

                $(element).niceScroll({
                    cursorcolor: 'rgba(0,0,0,0.4)',
                    cursorborder: 0,
                    cursorborderradius: 0,
                    cursorwidth: '4px',
                    bouncescroll: true,
                    mousescrollstep: 100,
                });
            }
        }
    })

    // Fixed block on scrolling
    .directive('fixedOnScroll', function () {
        return {
            link: function (scope, element, attr) {

                var elementPosition = $(element).offset();
                var elementWidth = $(element).outerWidth();
                var top = attr.fixedOnScroll == "" ? 85 : parseFloat(attr.fixedOnScroll);

                $(window).scroll(function () {

                    var fromTop = elementPosition.top - $(window).scrollTop();

                    if (attr.widthRelation) {
                        elementWidth = $("#" + attr.widthRelation).outerWidth();
                    }

                    if (fromTop < top) {
                        $(element).css({
                            'position': 'fixed',
                            'width': elementWidth,
                            'top': top
                        });
                    } else {
                        $(element).css({
                            'position': 'static',
                            'width': 'auto'
                        });

                        elementWidth = $(element).outerWidth();
                    }
                });
            }
        };
    })

    // Waves effect on buttons with class 'btn'
    .directive('btn', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {

                if (element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                    Waves.attach(element, ['waves-circle']);
                } else if (element.hasClass('btn-light')) {
                    Waves.attach(element, ['waves-light']);
                } else if (element.prop("tagName") == 'button') {
                    Waves.attach(element);
                }

                Waves.init();
            }
        }
    })

    // Add animated border and remove with condition when focus and blur on input with class 'form-control'
    .directive('formControl', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if (element.is('input') || element.is('textarea')) {
                    $(element).on('focus', function () {
                        $(this).closest('.fg-line').addClass('fg-toggled');
                    });

                    $(element).on('blur', function () {
                        var p = $(this).closest('.form-group');
                        var i = p.find('.form-control').val();

                        if (p.hasClass('fg-float')) {
                            if (i.length == 0) {
                                $(this).closest('.fg-line').removeClass('fg-toggled');
                            }
                        }
                        else {
                            $(this).closest('.fg-line').removeClass('fg-toggled');
                        }
                    });
                }
            }
        }
    })

    // =========================================================================
    // AUTO SIZE TEXTAREA
    // =========================================================================

    .directive('autoSize', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.autoResize();
            }
        }
    })

    // Focus on input
    .directive('autofocus', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (attr.autofocus === 'true') {
                    $timeout(function () {
                        $(element).find('input.autofocus').focus().select();
                    }, 100);
                }
            }
        }
    })

    // Reset form
    .directive('focusFormOnClick', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {

                var formId = attr.focusFormOnClick;

                $(element).click(function () {
                    $timeout(function () {
                        $('#' + formId).find('input.autofocus').focus();
                    }, 100);
                })
            }
        }
    })

    // Format amount
    .directive('moneyFormat', function () {
        return {
            link: function (scope, element, attr) {

                var decimals = attr.decimals ? attr.decimals : 0;
                var sign = attr.sign ? attr.sign : "";

                scope.$watch(attr.amount, function (value) {
                    var displayValue = sign.concat($.number(value, decimals, '.', ','));
                    $(element).html(displayValue);
                });
            }
        };
    })

    // Image popup
    .directive('ngImagePopup', function ($timeout) {
        return {
            link: function (scope, element, attr) {
                $timeout(function () {
                    $(element)
                        .css('cursor', 'pointer')
                        .magnificPopup({
                            type: 'image',
                            closeOnContentClick: true,
                            closeBtnInside: false,
                            fixedContentPos: true,
                            mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
                            image: {
                                verticalFit: true
                            },
                            zoom: {
                                enabled: true,
                                duration: 300 // don't foget to change the duration also in CSS
                            }
                        })
                }, 500);
            }
        }
    })

    // File upload in base64
    .directive('baseSixtyFourInput', [
        '$window',
        '$q',
        function ($window, $q) {

            var isolateScope = {
                onChange: '&',
                onAfterValidate: '&',
                parser: '&'
            };

            var FILE_READER_EVENTS = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];
            for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
                var e = FILE_READER_EVENTS[i];
                isolateScope[e] = '&';
            }

            return {
                restrict: 'A',
                require: 'ngModel',
                scope: isolateScope,
                link: function (scope, elem, attrs, ngModel) {

                    /* istanbul ignore if */
                    if (!ngModel) {
                        return;
                    }

                    var rawFiles = [];
                    var fileObjects = [];

                    elem.on('change', function (e) {

                        if (!e.target.files.length) {
                            return;
                        }

                        fileObjects = [];
                        fileObjects = angular.copy(fileObjects);
                        rawFiles = e.target.files; // use event target so we can mock the files from test
                        _readFiles();
                        _onChange(e);
                        _onAfterValidate(e);
                    });

                    function _readFiles() {
                        var promises = [];
                        var i;
                        for (i = rawFiles.length - 1; i >= 0; i--) {
                            // append file a new promise, that waits until resolved
                            rawFiles[i].deferredObj = $q.defer();
                            promises.push(rawFiles[i].deferredObj.promise);
                            // TODO: Make sure all promises are resolved even during file reader error, otherwise view value wont be updated
                        }

                        // set view value once all files are read
                        $q.all(promises).then(_setViewValue);

                        for (i = rawFiles.length - 1; i >= 0; i--) {
                            var reader = new $window.FileReader();
                            var file = rawFiles[i];
                            var fileObject = {};

                            fileObject.filetype = file.type;
                            fileObject.origin = file.name;
                            fileObject.filesize = file.size;

                            _attachEventHandlers(reader, file, fileObject);
                            reader.readAsArrayBuffer(file);
                        }
                    }

                    function _onChange(e) {
                        if (attrs.onChange) {
                            if (scope.onChange && typeof scope.onChange() === "function") {
                                scope.onChange()(e, rawFiles);
                            } else {
                                scope.onChange(e, rawFiles);
                            }
                        }
                    }

                    function _onAfterValidate(e) {
                        if (attrs.onAfterValidate) {
                            // wait for all promises, in rawFiles,
                            //   then call onAfterValidate
                            var promises = [];
                            for (var i = rawFiles.length - 1; i >= 0; i--) {
                                promises.push(rawFiles[i].deferredObj.promise);
                            }
                            $q.all(promises).then(function () {
                                if (scope.onAfterValidate && typeof scope.onAfterValidate() === "function") {
                                    scope.onAfterValidate()(e, fileObjects, rawFiles);
                                }
                                else {
                                    scope.onAfterValidate(e, fileObjects, rawFiles);
                                }
                            });
                        }
                    }

                    function _attachEventHandlers(fReader, file, fileObject) {

                        for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
                            var e = FILE_READER_EVENTS[i];
                            if (attrs[e] && e !== 'onload') { // don't attach handler to onload yet
                                _attachHandlerForEvent(e, scope[e], fReader, file, fileObject);
                            }
                        }

                        fReader.onload = _readerOnLoad(fReader, file, fileObject);
                    }

                    function _attachHandlerForEvent(eventName, handler, fReader, file, fileObject) {
                        fReader[eventName] = function (e) {
                            handler()(e, fReader, file, rawFiles, fileObjects, fileObject);
                        };
                    }

                    function _readerOnLoad(fReader, file, fileObject) {

                        return function (e) {

                            var buffer = e.target.result;
                            var promise;

                            // do not convert the image to base64 if it exceeds the maximum
                            // size to prevent the browser from freezing
                            var exceedsMaxSize = attrs.maxsize && file.size > attrs.maxsize * 1024;
                            if (attrs.doNotParseIfOversize !== undefined && exceedsMaxSize) {
                                fileObject.data = null;
                            } else {
                                var binary = '';
                                var bytes = new Uint8Array(buffer);
                                var len = bytes.byteLength;
                                for (var i = 0; i < len; i++) {
                                    binary += String.fromCharCode(bytes[i]);
                                }
                                fileObject.data = "data:" + file.type + ";base64," + $window.btoa(binary);
                            }

                            if (attrs.parser) {
                                promise = $q.when(scope.parser()(file, fileObject));
                            } else {
                                promise = $q.when(fileObject);
                            }

                            promise.then(function (fileObj) {
                                fileObjects.push(fileObj);
                                // fulfill the promise here.
                                file.deferredObj.resolve();
                            });

                            if (attrs.onload) {
                                if (scope.onload && typeof scope.onload() === "function") {
                                    scope.onload()(e, fReader, file, rawFiles, fileObjects, fileObject);
                                }
                                else {
                                    scope.onload(e, rawFiles);
                                }
                            }

                        };

                    }

                    function _setViewValue() {
                        var newVal = attrs.multiple ? fileObjects : fileObjects[0];
                        ngModel.$setViewValue(newVal);
                        _maxsize(newVal);
                        _minsize(newVal);
                        _maxnum(newVal);
                        _minnum(newVal);
                        _accept(newVal);
                    }

                    ngModel.$isEmpty = function (val) {
                        return !val || (angular.isArray(val) ? val.length === 0 : !val.data);
                    };

                    // http://stackoverflow.com/questions/1703228/how-can-i-clear-an-html-file-input-with-javascript
                    scope._clearInput = function () {
                        elem[0].value = '';
                    };

                    scope.$watch(function () {
                        return ngModel.$viewValue;
                    }, function (val) {
                        if (ngModel.$isEmpty(val)) {
                            scope._clearInput();
                        }
                    });

                    // VALIDATIONS =========================================================

                    function _maxnum(val) {
                        if (attrs.maxnum && attrs.multiple && val) {
                            var valid = val.length <= parseInt(attrs.maxnum);
                            ngModel.$setValidity('maxnum', valid);
                        }
                        return val;
                    }

                    function _minnum(val) {
                        if (attrs.minnum && attrs.multiple && val) {
                            var valid = val.length >= parseInt(attrs.minnum);
                            ngModel.$setValidity('minnum', valid);
                        }
                        return val;
                    }

                    function _maxsize(val) {
                        var valid = true;

                        if (attrs.maxsize && val) {
                            var max = parseFloat(attrs.maxsize) * 1000;

                            if (attrs.multiple) {
                                for (var i = 0; i < val.length; i++) {
                                    var file = val[i];
                                    if (file.filesize > max) {
                                        valid = false;
                                        break;
                                    }
                                }
                            } else {
                                valid = val.filesize <= max;
                            }
                            ngModel.$setValidity('maxsize', valid);
                        }

                        return val;
                    }

                    function _minsize(val) {
                        var valid = true;
                        var min = parseFloat(attrs.minsize) * 1000;

                        if (attrs.minsize && val) {
                            if (attrs.multiple) {
                                for (var i = 0; i < val.length; i++) {
                                    var file = val[i];
                                    if (file.filesize < min) {
                                        valid = false;
                                        break;
                                    }
                                }
                            } else {
                                valid = val.filesize >= min;
                            }
                            ngModel.$setValidity('minsize', valid);
                        }

                        return val;
                    }

                    function _accept(val) {
                        var valid = true;
                        var regExp, exp, fileExt;
                        if (attrs.accept) {
                            exp = attrs.accept.trim().replace(/[,\s]+/gi, "|").replace(/\./g, "\\.").replace(/\/\*/g, "/.*");
                            regExp = new RegExp(exp);
                        }

                        if (attrs.accept && val) {
                            if (attrs.multiple) {
                                for (var i = 0; i < val.length; i++) {
                                    var file = val[i];
                                    fileExt = "." + file.origin.split('.').pop();
                                    valid = regExp.test(file.filetype) || regExp.test(fileExt);

                                    if (!valid) {
                                        break;
                                    }
                                }
                            } else {
                                fileExt = "." + val.origin.split('.').pop();
                                valid = regExp.test(val.filetype) || regExp.test(fileExt);
                            }
                            ngModel.$setValidity('accept', valid);
                        }

                        return val;
                    }

                }
            };

        }
    ])

    // Directive for pie charts
    .directive('hcPieChart', function () {
        return {
            scope: {
                data: '=',
                showLabels: '='
            },
            link: function (scope, element, attr) {

                scope.$watch('data', function () {
                    var colorSet = Highcharts.colorSets[attr.colorSet] ? Highcharts.colorSets[attr.colorSet] : Highcharts.getOptions().colors;

                    Highcharts.chart(element[0], {
                        title: false,
                        colors: colorSet,
                        series: [{
                            data: scope.data,
                            dataLabels: {
                                enabled: scope.showLabels === undefined ? false : scope.showLabels,
                                format: '<b>{point.name}</b>: {point.y:.2f} ({point.percentage:.1f}%)'
                            }
                        }],
                        tooltip: {
                            headerFormat: '<span style="font-size:14px">{point.key}</span><br>',
                            pointFormat: '<b>{point.y:.2f}</b> ({point.percentage:.1f}%)'
                        },
                        chart: {
                            type: 'pie',
                            events: {
                                load: function (event) {
                                    var total = this.series[0].data[0].total;
                                    var text = this.renderer.text(
                                        'Всего: ' + total.toFixed(2),
                                        this.plotLeft,
                                        this.plotTop
                                    ).attr({
                                        zIndex: 5
                                    }).add(); // write it to the upper left hand corner
                                }
                            }
                        }
                    });
                });
            }
        };
    })

    // Directive for income+expense chart
    .directive('hcTurnoverChart', function () {
        return {
            scope: {
                data: '='
            },
            link: function (scope, element, attr) {

                scope.$watch('data', function () {

                    Highcharts.chart(element[0], {
                        chart: {
                            type: 'column'
                        },
                        title: false,
                        xAxis: [{
                            type: 'category',
                            crosshair: true
                        }],
                        yAxis: { // Primary yAxis
                            title: {
                                text: 'Доход / Расход',
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:14px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        series: [{
                            name: 'Доходы',
                            type: 'column',
                            color: '#4CAf50',
                            yAxis: 0,
                            data: scope.data.income
                        }, {
                            name: 'Расходы',
                            type: 'column',
                            yAxis: 0,
                            color: '#FF5722',
                            data: scope.data.expense
                        }]
                    });
                });
            }
        };
    })

    // Directive for air datepicker
    .directive('datePicker', function () {
        return {
            restrict: 'A',
            scope: {
                options: '&',
                ngModel: '=',
                onChange: '&'
            },
            link: function (scope, element, attrs, ctrl) {
                var defaults = {
                    autoClose: true,
                    dateFormat: "d MM, yyyy"
                };

                // view to model
                defaults.onSelect = function (formattedDate, date, inst) {

                    if (scope.ngModel instanceof Date && moment(scope.ngModel).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')) {
                        return false;
                    }

                    scope.ngModel = date;
                    scope.$apply();

                    if (scope.onChange) {
                        scope.$eval(scope.onChange);
                    }
                };

                // model to view
                scope.$watch('ngModel', function (newVal) {

                    if (!newVal) {
                        return false;
                    }

                    $(element).data('datepicker').selectDate(newVal);
                });

                // init
                scope.$watch(function () {
                    return scope.options();
                }, function (newVal) {
                    if (!newVal) return false;

                    if (newVal.minDate) newVal.minDate = new Date(newVal.minDate);
                    if (newVal.maxDate) newVal.maxDate = new Date(newVal.maxDate);

                    $(element).data('datepicker').update(angular.extend(defaults, newVal));
                }, true);

                $(element).prop('readonly', true);
                $(element).datepicker(angular.extend(defaults, scope.options()));
            }
        };
    })

    // =========================================================================
    // WRAP BUTTON FOR DATEPICKER
    // =========================================================================

    .directive('datePickerWrapper', function(){
        return {
            restrict: 'C',
            link: function(scope, element){
                element.click(function () {
                    var inputId = element.find('.date-picker').attr('id');
                    $('#' + inputId).data('datepicker').show();
                });
            }
        }
    })

    // =========================================================================
    // Fix for dropdown with overflow hidden in container
    // =========================================================================

    .directive('dropdownOverflow', function(){
        return {
            restrict: 'C',
            link: function(scope, element){
                element.click(function (){
                    var dropdownToggle = element.find('.dropdown-toggle');
                    var dropdownMenu =  element.find('.dropdown-menu');
                    var dropDownTop = dropdownToggle.offset().top + dropdownToggle.outerHeight();
                    dropdownMenu.css('position', 'fixed');
                    dropdownMenu.css('top', dropDownTop + 'px');
                    dropdownMenu.css('left', dropdownToggle.offset().left + 'px');
                });
            }
        }
    })

    // =========================================================================
    // INPUT MASK
    // =========================================================================

    .directive('inputMask', function(){
        return {
            restrict: 'A',
            scope: {
                inputMask: '='
            },
            link: function(scope, element){
                element.mask(scope.inputMask.mask);
            }
        }
    })



