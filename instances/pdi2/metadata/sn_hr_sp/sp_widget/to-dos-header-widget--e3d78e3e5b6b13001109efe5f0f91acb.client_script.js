function($scope, $sce, $sanitize) {
	var c = this;
	$scope.data.displayValueList[0] = $sce.trustAsHtml($sanitize($scope.data.displayValueList[0]));
	$scope.data.displayValueList[1] = $sce.trustAsHtml($sanitize($scope.data.displayValueList[1]));
}
    
