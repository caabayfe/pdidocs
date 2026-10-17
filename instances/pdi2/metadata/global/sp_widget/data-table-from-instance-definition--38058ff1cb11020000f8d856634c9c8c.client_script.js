function ($scope, spUtil, $location, spAriaFocusManager, $timeout, $rootScope) {
	var origSearch = $location.search();

	if ($scope.data.instanceOptionsChanged)
		$location.search('p', null);

	$scope.$on('data_table.page_changed', function(e, pageNum) {
		$scope.ignoreLocationChange = true;
		$location.search('p', pageNum);
		$location.search('spa', '1');
	});

	// To handle browser back if page number is changed
	$scope.$on('$locationChangeSuccess', function() {
		var s = $location.search();
		// Check if it's the same page
		if (origSearch.id !== s.id)
			return;

		if ($scope.ignoreLocationChange) {
			$scope.ignoreLocationChange = false;
			return;
		}

		var pageNum = s.p ? parseInt(s.p, 10) : 1;
		$rootScope.$broadcast('data_table.browser_back', {
			p: pageNum
		});
		$timeout(function() {
			var activeButton = angular.element(document.querySelector('.btn-group a.active'));
			if (activeButton.length)
				activeButton.focus();
		}, 10);
	});

	$scope.$on('data_table.click', function(e, parms){
		var p = $scope.data.page_id || 'form';
		var s = {id: p, table: parms.table, sys_id: parms.sys_id, view: 'sp'};
		var newURL = $location.search(s);
		spAriaFocusManager.navigateToLink(newURL.url());
	});
}
