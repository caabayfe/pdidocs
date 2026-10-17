function($rootScope, $scope, spUtil, cabrillo) {
    /* widget controller */
    var c = this;

    c.isMobile = spUtil.isMobile() || cabrillo.isNative();
    $scope.attachments = $rootScope.attachments;
    $scope.$watch(function() {
        return $rootScope.attachments
    }, function() {
        $scope.attachments = $rootScope.attachments;
    }, true);

}
