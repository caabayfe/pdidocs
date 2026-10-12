api.controller = function($scope, $sce, $timeout, $window, snAnalytics) {
    var c = this;
    c.asyncUpdate = function() {
        c.server.update();
    };
    var load_config = c.data.load_config;
    if (load_config === "async")
        setTimeout(c.asyncUpdate);
    c.panelClass = c.data.renderedFromMenuItem ? "parent-container" : "panel-body";
    c.panelWrapper = c.data.renderedFromMenuItem ? "" : "panel panel-default b panel-wrapper";
    c.itemsMargin = c.data.renderedFromMenuItem ? "flex-container menu-item-margin flex-container-cols" : "flex-container flex-container-cols-modal";

    $scope.handleClick = function(item, event) {
        if (event && (event.keyCode === 13 || event.keyCode === 32)) {
            event.preventDefault();
        }
        if (event.type === 'click' || (event.type === 'keydown' && (event.keyCode === 13 || event.keyCode === 32))) {
            if (item.type == 'guided_help') {
                c.server.get({
                    "action": "openGuidedhelp",
                    "guidedHelpId": item.guided_help
                }).then(function(resp) {
                    $timeout(function() {
                        $window.open(resp.data.guidedHelpResponse.url, '_self');
                        dismissModal();
                    }, raiseAppseeEvent(resp.data.guidedHelpResponse));
                });
            } else if (item.url && item.url.length > 0) {
                event.preventDefault();
                $timeout(function() {
                    var target = item.target == '_blank' ? '_blank' : '_self';
                    $window.open(item.url, target);
                    dismissModal();
                });
            }
        }
    };

    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };

    function raiseAppseeEvent(data) {
        if (!data.isNew) {
            return;
        }
        var payload = {};
        payload.name = "Guided Self-service Started";
        payload.data = {};
        payload.data["Guided Self-service"] = data.processName;
        payload.data["User Id"] = data.userId;
        payload.data["Source"] = data.source;
        snAnalytics.addEvent(payload);
    }

    function dismissModal() {
        if (c.data.renderedFromMenuItem) {
            $scope.$parent.$parent.$dismiss();
        }
    }
};
