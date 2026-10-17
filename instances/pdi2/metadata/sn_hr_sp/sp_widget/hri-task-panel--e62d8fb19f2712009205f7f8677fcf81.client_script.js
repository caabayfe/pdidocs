function hriTaskPanelController($scope, $location, $rootScope, spUtil) {
	var c = this;
	
	$location.search('rp_id',$scope.data.ciFromTask);
	
	$scope.toggleIcon = function($event) {
		$(event.target).toggleClass('fa-caret-right');
		$(event.target).toggleClass('fa-caret-down');
	};
	
	this.onClick = function($event, item, url, action) {
		$scope.data.current = url;
		$scope.data.selectedTask = url;			
		$rootScope.$broadcast('taskSelected', url);
	};

	if ($scope.data.table && $scope.data.filterList.length > 0) {
		angular.forEach($scope.data.filterList, function(filter) {
			spUtil.recordWatch($scope, $scope.data.table, filter, function(data){
				data = data.ext;
				if(data.sys_id == null || c.data.sysId == null) 
					return;
				$scope.data.sys_id = c.data.sysId;
				$scope.data.updated_record = data.sys_id;
				if ($scope.data.selectedTask == data.sys_id)
					$scope.data.selectedTask = data.sys_id;
				c.server.update();
			});
		});
	}
	
	c.update = function update() {
		c.server.update();
	};
	
	$scope.filterChildTasks = function(item) {
		var found = false;
		
		// No item to check; filter out
		if (!item)
			return false;

		// Filters turned off; do not filter
		if ($scope.data.filters == '')
			return true;				
		
		// Check for item assigned_to
		if(item.assigned_to == c.data.user)
				return true;

		// Check for item's children assogned_to; we want to show this case
		// if its child tasks include one that matches assigned_to as well
		angular.forEach(item.children, function(child) {
			if(child.assigned_to == c.data.user) 
				found = true;
		});

		return found;
	}; 
}
