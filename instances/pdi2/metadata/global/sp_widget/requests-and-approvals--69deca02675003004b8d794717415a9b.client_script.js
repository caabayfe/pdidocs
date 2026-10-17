function($scope, spUtil) {
  var c = this;
	$rootScope.hasRequestsOrApprovals = c.data.request.hasAny || c.data.approvals.hasAny;
	this.KEYS = {
						DOWN:40,
						LEFT:37,
						RIGHT:39,
						TAB:9,
						UP:38
					 };

	$scope.show_request = true;
	$scope.changePanel = function(panel_name) {
		if ($scope.show_request) {
			if (panel_name == 'approval')
				$scope.show_request = false;
		} else {
			if (panel_name == 'request')
				$scope.show_request = true;
		}
	};
	if (c.data.showApprovals)
		spUtil.recordWatch($scope, "sysapproval_approver", "state=requested^approverIN" +  $scope.data.approvals.myApprovals.toString());
	
	function get() {
		spUtil.update($scope).then(
			function(response) {
				if (!c.data.approvals.hasAny) {
					$scope.$$postDigest(function() {
						$('#tab-my-requests').click();
					});
				}
			});
	}

	$scope.approve = function(id) {
		$scope.data.op = "approved";
		$scope.data.target = id;
		get();
	};

	$scope.reject = function(id) {
		$scope.data.op = "rejected";
		$scope.data.target = id;
		get();
	};
	
	$scope.switchTab = function($event, tab) {
		var key = null;
		if (event.keyCode === c.KEYS.LEFT || event.keyCode === c.KEYS.UP)
			key = c.KEYS.LEFT;
		else if (event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN)
			key = c.KEYS.RIGHT;
		else if (event.keyCode === c.KEYS.TAB) {
			return;
		}
		if (key === null)
			return;

		$event.preventDefault();
		if (!c.data.approvals.hasAny)
			return;
		$scope.show_request = !$scope.show_request;
		if ($scope.show_request)
			$('div.request').focus();
		else
			$('div.approval').focus();
	}
}
