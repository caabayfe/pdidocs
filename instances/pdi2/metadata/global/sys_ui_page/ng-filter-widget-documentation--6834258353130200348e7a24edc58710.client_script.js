jQuery(document).ready(function() {

	angular.module('sn.filter_widget').controller('NgFilterTestPage', function($scope){
		$scope.table = 'incident';
		$scope.tableLabel = "Incident";
		$scope.filterConfig = {
			sets: true,
			saveFilter: true,
			loadFilter: true,
			testFilter: true,
			clearFilter: true,
			runFilter : true,
			sortFilter: true,
			closeFilter: true,
			dotWalking: true,
			encodedQuery : 'active=true',
			queryObj: '',
			relatedListQueryConditions: true,
			watchConfig: true
		};

		$scope.lists = [
		{
			label : "Incident",
			value : "incident"
		},
		{
			label : "Change Request",
			value : "cmdb_ci"
		}];

		$scope.setTable = function(table){
			var list = $scope.lists.filter(function(item){
				return item.value === table;
			})[0];

			$scope.tableLabel = list.label;
			$scope.$broadcast('snfilter:update_table', { table : list.value, tableLabel : list.label });
		};

		$scope.$on('snfilter:update_query', function(event, data){
			alert('query received! ' +  typeof data + ': ' + data);
		});
	});

	angular.bootstrap(document.getElementById('snfilterwidgettest'), [
		'sn.filter_widget',
		'sn.ngform',
		'sn.common.ui'
	]);
});
