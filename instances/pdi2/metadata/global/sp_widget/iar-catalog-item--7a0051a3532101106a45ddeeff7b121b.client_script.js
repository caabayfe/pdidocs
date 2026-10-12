function($scope, $sce, cabrillo) {
    /* widget controller */
    var c = this;
    $scope.$on("$sp.sc_cat_item.submitted", function(event, catalogReq) {
        $scope.data.action = "postProcessing";
        $scope.data.catalogSysId = catalogReq.sys_id;
        $scope.data.catalogTable = catalogReq.table;
        $scope.server.update().then(function(data) {
            if (data.isNative) {
                cabrillo.message.showMessage(cabrillo.message.SUCCESS_MESSAGE_STYLE, c.data.mobileTodoCompleteMsg);
                cabrillo.flowControl.flowEnded();
            }
        });
    });

    c.exitIAR = function() {
        c.server.get({
            action: 'IAROptout'
        })
    };
}
