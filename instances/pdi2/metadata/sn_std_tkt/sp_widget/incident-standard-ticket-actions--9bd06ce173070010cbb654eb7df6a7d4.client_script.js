function incidentTicketActions($scope, $http, spUtil, $timeout, spModal, i18n, $window, $uibModal, spAriaUtil) {
    /* widget controller */
    var c = this;
    c.doneLoading = false;
    c.resolvedIncidentMsg = "${Resolved Incident}";
    c.closedIncidentMsg = "${Closed Incident}";
    c.reopenedIncidentMsg = "${Reopened Incident}";

    var MOBILE_DEVICE_SCREEN_WIDTH = 767;
    $scope.mobileDevice = c.data.isMobile || ($window.innerWidth < MOBILE_DEVICE_SCREEN_WIDTH);

	$scope.resolveIncident = function() {
        $scope.data.action = 'resolveIncident';
        $scope.server.update(init).then(function(response){
					if (response.isIncidentResolved)
						spAriaUtil.sendLiveMessage(c.resolvedIncidentMsg);
				});
		$scope.$emit('focusOnActions', {"isFocusRequired": true});
    };

	$scope.closeIncident = function() {
		$scope.data.action = 'closeIncident';
        $scope.server.update(init).then(function(response){
					if (response.isIncidentClosed)
						spAriaUtil.sendLiveMessage(c.closedIncidentMsg);
				});
		var elm = document.getElementById('short-desc')
		elm.focus();
	};

    $scope.reopenIncident = function() {
        $scope.data.action = 'reopenIncident';
        $scope.server.update(init).then(function(response){
					if (response.isIncidentReopened)
						spAriaUtil.sendLiveMessage(c.reopenedIncidentMsg);
				});
			$scope.$emit('focusOnActions', {"isFocusRequired": true});
    };

    function init() {}

    $(document).on('click', 'div.modal-footer button.btn, ul#child-case-tabs .dropdown-menu', function(e) {
        e.stopPropagation();
    });

    $(document).bind('dragover drop', function(event) {
        event.preventDefault();
        return false;
    });

    $scope.$on('sp_loading_indicator', function(e, value) {
        if (!value && !c.doneLoading) {
            c.doneLoading = true;
        }
    });
}
