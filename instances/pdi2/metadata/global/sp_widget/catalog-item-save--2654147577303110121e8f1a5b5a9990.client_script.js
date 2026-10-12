api.controller = function($scope, $http, $timeout, cabrillo) {
    /* widget controller */
    var c = this;
    c.isNative = cabrillo.isNative() && c.data.isMEE;
    $scope.m = $scope.data.msgs;

    displayCabrilloElements();

    c.cancel = function() {
        removeCabrilloElements();
        $rootScope.$broadcast("$sp.service_catalog.save.cancel");
    }

    c.save = function() {
        if (!c.data.draftName || c.data.draftName.length > 200) {
            var errMsg = !c.data.draftName ? $scope.m.mandatoryMessage : $scope.m.maxLengthExceededMsg;
            if (c.isNative)
                cabrillo.message.showMessage(cabrillo.message.ERROR_MESSAGE_STYLE, errMsg);
            else
                c.errorMessage = errMsg;
            return;
        }

        removeCabrilloElements();
        $rootScope.$broadcast('$sp.service_catalog.save.submitted', {
            draft_name: c.data.draftName
        });
    }

    function removeCabrilloElements() {
        if (c.isNative) {
            cabrillo.viewLayout.setTitle(c.oldTitle);
            cabrillo.viewLayout.setNavigationBarButtons();
            cabrillo.viewLayout.setBottomButtons();
        }
    }

    function displayCabrilloElements() {
        if (c.isNative) {
            if (typeof cabrillo.viewLayout.getTitle == 'function') {
                cabrillo.viewLayout.getTitle().then(function(title) {
                    c.oldTitle = title;
                    cabrillo.viewLayout.setTitle($scope.m.saveDraft);
                });
            }

            cabrillo.viewLayout.hideBackButton();

            cabrillo.viewLayout.setNavigationBarButtons([{
                title: $scope.m.cancel,
                enabled: true
            }], function() {
                c.cancel();
            });

            var buttons = [{
                title: $scope.m.saveDraft,
                enabled: true,
                backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
                textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
            }];

            cabrillo.viewLayout.setBottomButtons(buttons, function() {
                c.save();
            });
        }
    }
};
