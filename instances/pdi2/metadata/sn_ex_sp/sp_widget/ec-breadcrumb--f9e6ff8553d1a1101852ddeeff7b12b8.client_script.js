api.controller = function($rootScope, $scope, $timeout) {
    /* widget controller */
    var c = this;
    $scope.breadcrumbsUpdated = false;

    var deregister = $rootScope.$on("sp.update.breadcrumbs", function(e, list) {
        if ($scope.data.choice === 'Breadcrumbs' && !$scope.breadcrumbsUpdated) {
            $timeout(function() {
                $rootScope.$broadcast("sp.update.breadcrumbs", $scope.data.breadcrumbs);
                $scope.breadcrumbsUpdated = true;
            });
        }
    });

    $scope.$on('$destroy', deregister); //When using $rootScope.$on, we need to unbind those listeners each time the $scope is destroyed. $scope.$on listeners are automatically unbound, but we’ll need to manually unbind on the $destroy event:

    $rootScope.$on("ec.breadcrumb.showback", function() {
        c.data.widgetID = 'hrm-back-button';
    });

    $rootScope.$on("ec.breadcrumb.showbreadcrumb", function() {
        c.data.widgetID = 'breadcrumbs';
    });
};
