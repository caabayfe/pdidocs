function ($scope, spUtil, snRecordWatcher, $rootScope, $sce) {
	var c = this;
	$scope.standalone = $scope.options.standalone == 'true' || $scope.options.standalone == true;
  var q = "cmdb_ci.sys_class_name=cmdb_ci_service";
  if ($scope.data.outageIDs != "")
    q += "^NQsys_idIN" + $scope.data.outageIDs;
	
	spUtil.recordWatch($scope, "cmdb_ci_outage", q, function() {
		$scope.server.update();
		$rootScope.$broadcast("sp.outage.updated");
	});
	
	$scope.trustAsHtml = function(html) {
		return $sce.trustAsHtml(html);
	};
	
}
