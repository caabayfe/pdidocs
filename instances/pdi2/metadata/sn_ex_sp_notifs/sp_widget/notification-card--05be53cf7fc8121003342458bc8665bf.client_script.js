api.controller = function($scope, $location, $timeout) {
    /* widget controller */
    var c = this;
    c.timeout = $timeout;
    $scope.isNotificationActive = true;
    $scope.getStyle = function() {
        var styleObj = {};
        if (c.data.isCritical)
            return styleObj;
        styleObj['background-color'] = c.data.cardData.iconBackground;
        return styleObj;
    };

    $scope.openNotificationKeyDown = function($event) {
        if ($event.key === 'Enter' || $event.key === ' ') {
            if (!$event.target.classList.contains("button-action") && !$event.target.classList.contains("undo-btn")) {
                if ($scope.isNotificationActive) {
                    $scope.openNotification('secondary');
                }
            }
        }
    }

    $scope.openNotification = function(param) {
        c.server.get({
            "action": "MARK_AS_READ",
            "sysId": c.data.cardData.sysId,
            "isUnread": c.data.cardData.state != "opened"
        }).then(function(res) {
            if (param == 'secondary') {
                $location.search(c.data.cardData.url.substring(1));
            }
            c.data.isUnread = false;

            $scope.$emit('CLOSE_NOTIFICATION_TRAY');
        });
    };

    angular.element('time').attr("tabindex", -1);
    angular.element('time > span').attr("tabindex", -1);

    c.handleAction = function(event, action, data) {
        event.preventDefault();
        // gives the names to map server API calls
        let actionName = isInversed(action, data) ? action.inverseActionName : action.actionName;

        // generic server call for all utility actions
        c.serverActionCall(event, actionName);

        angular.element('.action-dropdown.open').get(0).classList.toggle('open');
    };

    c.handleUndoKeyDown = function($event, actionName) {
        event.preventDefault();
        if ($event.key === 'Enter' || $event.key === ' ') {
            c.serverActionCall($event, actionName);
        }
    }

    c.serverActionCall = function(event, actionName) {
        event.preventDefault();
        c.server.get({
            "action": actionName,
            "sysId": c.data.cardData.sysId,
            "active_status": !$scope.isNotificationActive,
            "isUnread": c.data.isUnread
        }).then(function(res) {
            if (actionName == "MARK_AS_READ" || actionName == "MARK_AS_UNREAD") {
                c.data.isUnread = !c.data.isUnread;
            }
            if (actionName == "MARK_AS_READ" && c.data.viewUnreadNotifications) {
                $scope.$emit('NOTIFICATION_MARK_AS_READ', c.data.cardData.sysId);
            }
            if (actionName == "CLEAR_NOTIFICATION" || actionName == "UNDO") {
                $scope.isNotificationActive = !$scope.isNotificationActive;
                c.handleUndofocus(actionName);
            }
        });
    };

    c.getName = function(action, data) {
        return isInversed(action, data) ? action.inverseLabel : action.label;
    };

    const isInversed = (action, data) => {
        const {
            actionName,
        } = action;
        if (actionName == 'MARK_AS_READ') {
            return !data.isUnread;
        }
        return false;
    };
};
