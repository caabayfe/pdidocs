function hrjTaskURLController($scope, $sce, $timeout) {
	var c = this;
	$scope.trustedUrl = $sce.trustAsResourceUrl($scope.data.task.url);
	$scope.disableCompletedButton = true;

	if ($scope.data.task.description) {
		c.description = $sce.trustAsHtml($scope.data.task.description);
	}
	
	$scope.clickOnTaskLink = function() {
		$timeout(function() {
			$scope.disableCompletedButton = false;
		}, 1000);
	};
}
