api.controller = function($rootScope, $scope) {
    /* widget controller */
    var c = this;

    var todoActionEvent = $rootScope.$on('todoActionEvent', function(e, obj) {
        $(".v38a3a159530201101865ddeeff7b1263").css('display', 'none');
    });
    $scope.$on('$destroy', todoActionEvent);

    var reloadCommonAndPrimaryInfo = $scope.$on('reloadCommonAndPrimaryInfo', function($event) {
        c.data.action = "loadCommonAndPrimaryInfo";
        c.data.commonInfoWidget = undefined;
        c.data.primaryInfoWidget = undefined;
        c.server.update();
    });
    $scope.$on('$destroy', reloadCommonAndPrimaryInfo);
};
