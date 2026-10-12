function($scope, spScUtil, i18n) {
	$scope.data = {};
  var c = this;
	c.close = function() {
		$rootScope.$broadcast("$sp.service_catalog.close_cloning", true);
	}

	$scope.data.currentMessage = '';
	$scope.data.name = i18n.getMessage('Cloning');
	$scope.data.output = '';
	$scope.data.status = 0;
	$scope.data.reqMap = {};
	$scope.data.portalSuffix = c.data.portal_suffix;

	var interval = setInterval(function() {
		$scope.server.get({
			action: "progress_worker",
			pid: $scope.options.pid,
			request_id: $scope.options.request_id
		}).then(function(response) {
			var res = response.data.result;
			$scope.data.message = res.message;
			$scope.data.name = res.name;
			if (res.output_summary)
				spScUtil.queryMultipleRecords('sc_request', {sysparm_query: 'numberIN' + res.output_summary}).then(function(response) {
					var result = response.data.result;
					for (var i = 0; i < result.length; i++)
						$scope.data.reqMap[result[i].number] = result[i].sys_id;
				});
			var curMsg = res.message.split(/[()]/)[1];
			if (curMsg) {
				var stepNum = curMsg.match(/\d+/g);
				$scope.data.status = parseInt(stepNum[0] * 100 / stepNum[1]);
			}
			if (res.state === "complete") {
				$scope.data.status = 100;
				clearInterval(interval);
			}
		})
	}, 5000);
}
