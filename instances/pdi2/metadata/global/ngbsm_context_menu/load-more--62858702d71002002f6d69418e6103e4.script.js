loadMore();

function loadMore() {
	// Fetch more data as if were were loading the graph from the given CI, but append
	// the loaded data instead of switching to the new data set
	
	// First check that we are not trying to load from a collapsed nodes(Cluster Virtual& Group)
	if(item.isCollapsed) {
		console.error("MENU ACTION ->'Load More' menu action should not work on collapsed node",item);
	}
	else {
		// Perform a basic load of data from the selected node
		bsmRepository.expandGraph(item.id, bsmURL.getParameter('level'), undefined, undefined , 'loadMore').then(function() {
			// Signal BSM to rerender once we have new data
			$rootScope.$broadcast('ngbsm.new_graph_loaded');
		});
	}
}
