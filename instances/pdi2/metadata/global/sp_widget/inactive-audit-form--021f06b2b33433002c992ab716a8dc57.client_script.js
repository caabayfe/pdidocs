function($scope, spUtil) {
  /* widget controller */
  var c = this;  
  spUtil.setBreadCrumb($scope, $scope.data.breadcrumbs);
}
