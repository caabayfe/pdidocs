function hrnInboundTaskController($scope, $sce, $timeout) {
	$scope.trustedUrl = $sce.trustAsResourceUrl($scope.data.task.url);
	
}
