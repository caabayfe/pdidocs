function ($scope, spUtil, $sce, $rootScope, $timeout, $location, i18n) {
		
	$scope.publishedMsg = i18n.getMessage('Published');
	$scope.$on('$locationChangeSuccess', function(e) {
		var uriHash = $location.hash();
		var decodedUriHash = decodeURIComponent(uriHash);
		if (uriHash !== decodedUriHash)
			$location.hash(decodedUriHash);
	});
	spUtil.setSearchPage('kb');
	$scope.data.text = $sce.trustAsHtml($scope.data.text);
	$timeout(function() {
		$rootScope.$broadcast('sp.update.breadcrumbs', $scope.data.breadcrumbs);
	});
}
