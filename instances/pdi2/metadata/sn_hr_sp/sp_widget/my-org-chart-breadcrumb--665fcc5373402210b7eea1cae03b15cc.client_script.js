api.controller = function($scope, $rootScope, previousRouteService) {
    var c = this;

    var extractPageIdFromUrl = function(urlString) {
        try {
            var url = new URL(urlString);
            var params = url.searchParams;
            return params.get('id') || '';
        } catch (e) {
            return '';
        }
    };

    c.data.previousTrail = extractPageIdFromUrl(previousRouteService.getPreviousUrl());
    c.server.update().then(function() {
        $scope.$applyAsync(function() {
            $rootScope.$broadcast("sp.update.breadcrumbs", $scope.data.breadcrumbs);
        });
    });

};
