function($scope, $timeout,i18n) {
	var c = this;
	c.closeMsg = i18n.getMessage("Close Notification");	

	$scope.$on("$$uiNotification", function(evt, $$uiNotification) {
		evt.preventDefault();
		if (evt.stopPropagation)
			evt.stopPropagation();
		addUiNotification($$uiNotification);
	});
	
	var notificationAutoDismissTimeout;
	function addUiNotification($$uiNotification) {
		if (angular.isArray($$uiNotification) && !$$uiNotification.length)
			return;

		if (angular.isArray($$uiNotification) && $$uiNotification.length > 0)
			c.$$uiNotification = $$uiNotification;
		else {
			if (!angular.isArray($scope.$$uiNotification))
				c.$$uiNotification = [];

			c.$$uiNotification.push($$uiNotification);
			$timeout(function(){
				$scope.$emit('sp.widget-modal.clear-focus-cache');

				if (typeof g_accessibility !== "undefined" && g_accessibility == "true")
					$('.modal-body .btn-link').first().focus();
			}, 50);
		}

		$timeout.cancel(notificationAutoDismissTimeout);
		var seconds = (typeof g_notif_timeout !== "undefined") ? g_notif_timeout : 5;
		if (c.$$uiNotification.length == 1 && c.$$uiNotification[0].type == 'trivial')
			seconds = 2;

		notificationAutoDismissTimeout = $timeout(function(){
			if (seconds > 0 && typeof g_accessibility !== "undefined" && g_accessibility == "false")
				c.dismissNotifications();
		}, seconds * 1000);
	}
	
	c.dismissNotifications = function() {
		angular.forEach(c.$$uiNotification, function(notification){
			notification.visible = false;
		});
		$timeout(function(){
			c.$$uiNotification = {};
			$scope.$emit('sp.widget-modal.clear-focus-cache');
		}, 20);
	}

	c.revealNotification = function($$uiNotification){
		$timeout(function(){
			$$uiNotification.visible = true;
		}, 20);
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// End notification handling
	/////////////////////////////////////////////////////////////////////////////////////////////////////
}
