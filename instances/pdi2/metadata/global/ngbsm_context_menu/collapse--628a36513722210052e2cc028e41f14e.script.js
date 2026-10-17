function _collapseVirtualGraph(rootId, selectedItem) {
	// Collapsed back to virtual group
	bsmRepository.collapseGraph(rootId, selectedItem).then(function() {
		// Signal BSM to rerender once we have new data
		$rootScope.$broadcast('ngbsm.new_graph_loaded');
	});
}

function _collapseClusterGraph(rootId) {
	// Simply reload the data without any sticky nodes specified
	bsmRepository.loadGraph(rootId, bsmURL.getParameter('level')).then(function() {
		// Signal BSM to rerender once we have new data
		$rootScope.$broadcast('ngbsm.new_graph_loaded');
	});
}

function _showConfirmationDialog(rootId, selectedItem) {
	var dialogConfig = {
		title : i18n.getMessage('Map update:'),
		msg : i18n.getMessage('If you continue with the current update to the map, changes previously made by a Load More operation – will be lost'),
		buttons:[{
			label : i18n.getMessage('Cancel'),
			css: 'btn-default',
			onClick : function (){}
			},{
				label : i18n.getMessage('Continue'),
				css: 'btn-primary',
				onClick : function (){
					graphWasChanged = false;
					_collapseVirtualGraph(rootId, selectedItem);
				}
			}
			]
	};
	$rootScope.$broadcast('ngbsm.open_bsm_dialog', dialogConfig);
}
	
function collapse() {
		var id = bsmGraph.current().root.id;
		
		if (item.isCluster){
			_collapseClusterGraph(id);
		} else {
			//Need to send a warnning (the sate probably will be lost), in case the graph was changed already by other action (e.g. loadMore)
			if (graphWasChanged){
				_showConfirmationDialog(id, item );	
			} else {
				_collapseVirtualGraph(id, item);
			}
		}
}
collapse();
