function previousRouteService($rootScope) {
	var previousUrl = null;

	$rootScope.$on('$locationChangeSuccess', function(event, next, current) {
		previousUrl = current;
	});

	return {
		getPreviousUrl: function() {
			return previousUrl;
		}
	};

}
