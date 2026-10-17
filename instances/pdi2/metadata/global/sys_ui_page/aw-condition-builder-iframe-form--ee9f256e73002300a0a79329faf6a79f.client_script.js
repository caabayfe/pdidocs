jQuery(document).ready(function() {
	angular.module('sn.filter_widget').controller('NgAwConditionBuilder', function($scope, $window){
		var encodedConditionString = document.getElementById('encoded_conditions').value,
			conditionsString = getConditionsParam($window.location.href);
		
		$scope.table = document.getElementById('jvar_my_list_table').value;
		$scope.tableLabel = "";
		$scope.tinyUrl = document.getElementById('jvar_query_tiny_url').value;
		$scope.filterConfig = {
			sets: true,
			hideHeader: false,
			saveFilter: false,
			loadFilter: false,
			testFilter: false,
			clearFilter: false,
			runFilter : false,
			sortFilter: false,
			closeFilter: false,
			dotWalking: true,
			encodedQuery: conditionsString,
			queryObj: '',
			relatedListQueryConditions: false,
			watchConfig: true
		};
		
		$scope.updateConditions = function() {
			var queryString;
			if (angular.isDefined($scope.updatedQuery)) {
				queryString = $scope.updatedQuery.toQueryString();
			}
			if (typeof queryString == 'undefined' || queryString === '') {
				queryString = 'CLEAR';
			}
			if (queryString !== conditionsString) {
				iframeMsgHelper.confirm(queryString);	
			}
			return false;
		};
		
		$scope.cancelModal = function() {
			closeModal();
		};
		
		function closeModal() {
			window.location.href = 'ws_blank_page.do';
		}
		
		function getConditionsParam(uri) {
			var result = '';
			if (angular.isDefined(uri)) {
				uri.split('&').map(function (part) {
					if(part.startsWith('sysparm_tiny')) {
						result = decodeURIComponent(encodedConditionString);
					}
					if(part.startsWith('sysparm_mylist_conditions')) {
						var conditions = part.split('=');
						result = decodeURIComponent(conditions[1]);
					}
				});
			}
			return result;
		}

		$scope.$on('snfilter:update_query', function(event, data){
			$scope.updatedQuery = data;
			$scope.awconditionbuilder.$setDirty();
		});
	});

	angular.bootstrap(document.getElementById('snawconditionbuilderwidget'), [
		'sn.filter_widget',
		'sn.ngform',
		'sn.common.ui'
	]);
});
