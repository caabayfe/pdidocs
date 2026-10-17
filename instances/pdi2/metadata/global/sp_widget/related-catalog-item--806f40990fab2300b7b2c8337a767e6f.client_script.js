function(cabrillo,$scope,$rootScope,$location,urlTools) {
	var c = this;
	c.isNativeMobile = cabrillo.isNative();
	$rootScope.$watch('isSCCartFixed', function(newVal){
		$scope.isSCCartFixed = newVal;
	});

	var locationChangeEventListener = $rootScope.$on("$locationChangeSuccess", function($event,newURL,oldURL) {
		var key = $scope.options.source_id || 'sys_id';
		var newURLParts = urlTools.parseQueryString(newURL);
		var oldURLParts = urlTools.parseQueryString(oldURL);
		if (newURLParts[key] == oldURLParts[key])
			return;

		c.server.update();
	});

   $scope.$on('$destroy', function() {
        locationChangeEventListener();
  });
}
