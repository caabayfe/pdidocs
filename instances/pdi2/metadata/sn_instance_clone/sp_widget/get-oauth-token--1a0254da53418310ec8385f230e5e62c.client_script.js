api.controller = function($scope, $window, $timeout) {

    var c = this;
    // Spinner shows until the (already server-evaluated) data is revealed.
    c.loading = true;
    $timeout(function() {
        c.loading = false;
    }, 1500);

    c.openAuthWindow = function() {
        if (c.data.redirectUrl) {
            $window.open(c.data.redirectUrl, '_blank');
        } else {
            console.error('Redirect URL is not set');
        }
    };

    c.onCancel = function() {
        c.server.get({ action: 'cancel' }).then(function() {
            $window.close();
        });
    };
};
