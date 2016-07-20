App
    // Notify message service
    .factory('notifyService', function () {
        return {
            notify: function (message, type) {

                $.noty.closeAll();

                if (!type) {
                    type = 'alert';
                }

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
            }
        }
    });
