api.controller=function($scope, spPreference) {
	if ($scope.data.contexts.length > -1) {
		if (!$scope.options.shared)
			$scope.options.shared = {};
		$scope.options.shared.context = $scope.data.contexts[$scope.data.index];
	}
	
	$scope.setPreferenceValue = function() {
		g_encryption_context = $scope.options.shared.context.value;
		spPreference.set("encryption_context", $scope.options.shared.context.value);
	};
};
