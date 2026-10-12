var recipient_list_detail = angular.module('RecipientListModule', ['sn.ngUserSelection']);
recipient_list_detail.controller('RecipientListContentController', function($scope, $attrs, $http) {
	
	$scope.setUpMethod = g_form.getValue('method');
	
	CustomEvent.observe("recipient_list.method.changed", function(method){
		$scope.setUpMethod = method;
		$scope.$apply();
	});
	
	$scope.startingDirective = function(){
		
	};
});
