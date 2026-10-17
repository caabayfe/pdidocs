api.controller=function($scope) {
  var c = this;
  
  $scope.loading = true;
  
  c.asyncGet = function() {
    c.data.action = "loadData";
    c.server.update().then(function(response) {
      $scope.loading = false;
    });
  };
  
  c.showAll = function(showAll) {
    c.data.displayLimit = showAll ? c.data.items.length : c.data.paginationLimit;
  };
  
  c.getIconClass = function(contentTable) {
    var iconMap = c.data.contentTypeIcons;
    return iconMap[contentTable] || iconMap.DEFAULT;
  };
  
  var loadConfig = c.data.loadConfig;
  if (loadConfig === "async")
    setTimeout(c.asyncGet);
  else {
    $scope.loading = false;
  }
};
