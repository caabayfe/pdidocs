focus();

function focus() {
	// Load a graph from the selected node
	bsmRepository.loadGraph(item.id, bsmURL.getParameter('level')).then(function() {
		// After the data is loaded broadcast an event to notify BSM that there is new data to render
		$rootScope.$broadcast('ngbsm.new_graph_loaded');
	});
}
