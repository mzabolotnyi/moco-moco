App
    // Notify message service
    .factory('notifyService', function () {
        return {
            notify: function (message, type) {

                $.noty.closeAll();

                noty({
                    text: message,
                    type: type,
                    timeout: 3000,
                    animation: {
                        open: 'animated fadeIn',
                        close: 'animated fadeOut'
                    }
                });
            },
            notifyError: function (message) {
                this.notify(message, 'error');
            },
            alert: function (message, type) {
                swal({
                    title: '',
                    text: message,
                    type: type,
                    animation: false
                })
            },
            alertWarning: function (message) {
                this.alert(message, 'warning');
            },
            confirm: function (options, callback) {

                options.title = '';
                options.cancelButtonText = 'Отмена';
                options.animation = false;

                swal(options, callback);
            },
            confirmWarning: function (message, confirmText, callback, closeOnConfirm) {
                this.confirm({
                    text: message,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: confirmText,
                    closeOnConfirm: closeOnConfirm
                }, callback);
            },
            confirmDelete: function (message, callback, closeOnConfirm) {
                this.confirmWarning(message, "Удалить", callback, closeOnConfirm);
            },
            showLoadBar: function () {

                var text = '<div class="preloader pls-teal d-block m-b-5"><svg class="pl-circular" viewBox="25 25 50 50"><circle class="plc-path" cx="50" cy="50" r="20"></circle></svg></div><span>Загрузка...</span>';

                swal({
                    title: '',
                    text: text,
                    html: true,
                    showConfirmButton: false,
                    animation: false,
                    timer: 30000
                });
            },
            hideLoadBar: function () {
                swal.close();
            }
        }
    })

    // Http helper
    .factory('httpHelper', function () {
        return {
            prepareGetParam: function (name, value, type, valueEndRange) {

                //format Date params
                if (value instanceof Date){
                    value = this.formatDateGetParam(value);
                }

                if (valueEndRange instanceof Date){
                    valueEndRange = this.formatDateGetParam(valueEndRange);
                }

                //prepare get param string
                var paramParts = [name, '='];

                if (type === 'like') {
                    paramParts.push('^', value);
                } else if (type === 'not') {
                    paramParts.push('!', value);
                } else if (type === 'more') {
                    paramParts.push('>', value);
                } else if (type === 'moreOrEqual') {
                    paramParts.push('>=', value);
                } else if (type === 'less') {
                    paramParts.push('<', value);
                } else if (type === 'lessOrEqual') {
                    paramParts.push('<=', value);
                } else if (type === 'range') {
                    paramParts.push(value, ':', valueEndRange);
                } else {
                    paramParts.push(value);
                }

                return paramParts.join('');
            },
            formatDateGetParam: function (date) {
                return moment(date).format('YYYY-MM-DD');
            }
        }

    });
