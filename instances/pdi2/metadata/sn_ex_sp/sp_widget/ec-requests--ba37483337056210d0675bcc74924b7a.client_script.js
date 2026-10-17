api.controller = function($timeout, $scope, $rootScope) {
    var c = this;
    c.isLoading = true;
    
    // Listen for the loading complete event from EC request tabs
    var unregister = $rootScope.$on('ec_request_tabs.loading_complete', function() {
        c.isLoading = false;
    });
    
    // Clean up the event listener when the scope is destroyed
    $scope.$on('$destroy', function() {
        unregister();
    });
};
