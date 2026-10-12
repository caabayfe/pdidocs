function($scope, runtimeState, meetingAttendees, $q, $log, $uibModalStack) {
	var c = this;
	
	var meeting = {
		// Populated on init
		"record": null,
		"runtimeState": null,
		"attendeeUserIdList": []
	};
	$scope.meeting = meeting;

	var attendeeSearch = {
		"performed": false,
		"query": "",
		"running": false,
		"results": [],
		
		"run": function() {
			attendeeSearch.running = true;
			var queryString = attendeeSearch.query;
			if (queryString.length === 0)
				queryString = "__firstInit";
			
			meetingAttendees.search(queryString)
			.then(function(attendeeResults) {
				attendeeSearch.results = attendeeResults;
				attendeeSearch.running = false;
				attendeeSearch.performed = true;
				$uibModalStack.clearFocusListCache();
			},
			function() {
				attendeeSearch.results = [];
				attendeeSearch.running = false;
				attendeeSearch.performed = true;
			});
		},
		"limitedInitialResults": function() {
			return attendeeSearch.results.length == 50 &&
				attendeeSearch.performed &&
				attendeeSearch.query === "" &&
				meeting.attendeeUserIdList.length > 50;
		}
	};
	$scope.attendeeSearch = attendeeSearch;
	
	runtimeState.get($scope.data.meetingId)
	.then(function(rs) {
		meeting.runtimeState = rs;
		meeting.record = rs.cab_meeting.record;
		return meetingAttendees.get($scope.data.meetingId);
	})
	.then(function(attendeeUserIdList) {
		meeting.attendeeUserIdList = attendeeUserIdList;
		
		$scope.$watch("attendeeSearch.query", function(newValue, oldValue) {
			if (attendeeSearch.running)
				return;
			
			if (newValue.length < 2 && newValue.length > 0)
				return;
			
			attendeeSearch.run();
		});
	});
}
