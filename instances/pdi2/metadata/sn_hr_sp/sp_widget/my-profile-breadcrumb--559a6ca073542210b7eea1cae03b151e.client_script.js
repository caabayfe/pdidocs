api.controller=function($scope, $rootScope, previousRouteService) {

	// instantiating service to save previous url
	previousRouteService.getPreviousUrl();

};
