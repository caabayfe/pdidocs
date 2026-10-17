function hrmBackButtonController($scope, $window) {
	var c = this;
	c.hideBack=false;
	if ($window.history.length == 1)
		c.hideBack=true;
	$scope.backText = '${Back}';
}
