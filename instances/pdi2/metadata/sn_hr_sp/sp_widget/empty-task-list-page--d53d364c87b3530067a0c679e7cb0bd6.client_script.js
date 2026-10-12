function emptyTaskListPageController($scope) {
	var c = this;
	$scope.hasNoFilterSelections = false;
	$scope.$on('sn_hr_sp.emptyStateCounts', function(event, obj) {
		c.title = c.data.messages.NO_TODOS_YET;
		c.message = c.data.messages.NO_TODOS_ASSIGNED;
		c.isFutureState = false;
		c.isInvalidURL = false;
		c.icon = 'fa-check-circle';
		$scope.hasNoFilterSelections = !!obj.hasNoFilterSelections;

		var isCompleted;
		if (obj.isValid) {
			
			if (obj.badgeInfo[obj.assignmentFilter])
				isCompleted = obj.badgeInfo[obj.assignmentFilter].hasCompletedToDo;

			if (isCompleted)
				c.message = c.data.messages.ALL_TODOS_COMPLETE;
			else if ($scope.hasNoFilterSelections){
				c.message = c.data.messages.NO_TYPE_FILTER_SELECTED;
				c.icon = 'fa-meh-o';
			}
			else 
				c.message = c.data.messages.NO_TODOS_ASSIGNED;

			if (c.data.isLEInstalled) {
				if (obj.activitySetState) {
					if (obj.activitySetState == c.data.awaitingTriggerState) {
						c.message = c.data.messages.WAIT_FOR_NOTIFICATION;
						c.isFutureState = true;
					}
				} else
					getServerResponse(obj.activitySetId);
			}

		} else {
			c.message = c.data.messages.NO_CASE_FOUND;
			c.isInvalidURL = true;
		}
	});	

	function getServerResponse(activitySetId) {
		$scope.data.request = {
			selectedSetId: activitySetId
		};

		$scope.server.get({request: $scope.data.request}).then(function(response) {
			if (response.data) {
				if ('message' in response.data)
					c.message = response.data.message;

				if ('isFutureState' in response.data)
					c.isFutureState = response.data.isFutureState;
			}
		});
	}
}
