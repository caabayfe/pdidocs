function($scope, $location,$rootScope, $timeout) {
  /* widget controller */
  var c = this;

	if (c.data.selectedIndex == 0) //Populate kb_id as null when more one than KB is associates with Portal and no KB is selected.
		$location.search('kb_id', c.data.kbId);
	
	// Update breadcrumbs with knowledge base name 
	if (c.data.kbId && c.data.kbs.length > 1) {
		c.data.breadcrumbs = [{label: c.data.kbName, url: '#'}];
		
	  //Add "All Knowledge" link to breadcrumbs only when multiple KBs are associated to portal.
			c.data.breadcrumbs.unshift({label: c.data.kbBreadCrumbsMsg, url: '?id='+ c.data.kb_knowledge_page});	
	} else
		c.data.breadcrumbs = [{label: c.data.kbBreadCrumbsMsg, url: '#'}];
	
	//Update breadcrumbs
	$timeout(function() {
		$rootScope.$broadcast('sp.update.breadcrumbs', c.data.breadcrumbs);
	});
	
	$scope.selectedKB = c.data.kbArr[c.data.selectedIndex];
	//Refresh page by passing kb_id when KB is selected
	$scope.changeKB = function (selectedKB) {
		$timeout(function() {
			if (selectedKB.hasOwnProperty("id")) {
				$location.search({kb_id: selectedKB.id, sys_id: null, id: c.data.kb_knowledge_page, kb_category: null});
        		$scope.isExpanded = false;
			} else
			$scope.isExpanded = true;
		});
	}
}
