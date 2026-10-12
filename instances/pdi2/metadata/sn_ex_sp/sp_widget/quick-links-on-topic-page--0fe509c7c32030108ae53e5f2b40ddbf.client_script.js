api.controller = function($scope, $timeout, $window, snAnalytics, $element, $sce) {
    /* widget controller */
    var c = this;
    $scope.widgetTitleHtml = getHeadingHtml();

    $(window).resize(handleToolTip);
    $scope.$evalAsync(handleToolTip);
    
    function getHeadingHtml() {
        var headingHtml = '<' + c.data.headingLevel + ' class="title" id="' + c.data.instanceId + '-widget-title">' + c.data.quickLinkHeader + '</' + c.data.headingLevel + '>';
        return $sce.trustAsHtml(headingHtml);
    }

    function handleToolTip() {
        $timeout(function() {
            $(".quick-link").each(function(index) {
                var hideToolTip = false;
                var span = $(this).find(".card-title");
                if (span && span[0] && span.width() >= span[0].scrollWidth) {
                    hideToolTip = true;
                }
                if (hideToolTip) {
                    $(this).tooltip('disable');
                } else {
                    $(this).tooltip('enable');
                }
            });
        }, 100);
    }

    $scope.clicked = function(item, event) {
        $(event.currentTarget).tooltip('hide');
        if (item.type == 'guided_help') {
            c.server.get({
                "action": "openGuidedhelp",
                "guidedHelpId": item.guided_help
            }).then(function(resp) {
                $timeout(function() {
                    $window.open(resp.data.guidedHelpResponse.url, '_self');
                }, raiseAppseeEvent(resp.data.guidedHelpResponse));
            });
        }
    };

    $scope.$on('$destroy', function() {
        $element.find('[data-toggle="tooltip"]').tooltip('destroy');
    });

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


    $scope.hasNonGuidedQuickLinks = function() {
        for (var i = 0; i < c.data.json_data.length; i++) {
            if (c.data.json_data[i].type != 'guided_help') {
                return true;
            }
        }
        return false;
    };

};
