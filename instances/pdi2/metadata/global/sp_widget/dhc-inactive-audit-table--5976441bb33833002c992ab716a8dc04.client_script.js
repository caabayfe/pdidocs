function($scope, $location) {

  /* widget controller */
  var c = this;
	
	$scope.$on('data_table.click', function(e, data)  {
		$location.search('sys_id', data.sys_id);
	})
}
