var _loading= function(rootId, selectedItem){
	bsmRepository.loadGraph(rootId, bsmURL.getParameter('level'), selectedItem.collapsedIds.split(','), undefined, selectedItem.isCluster, selectedItem.id).then(function() {
		// Signal BSM to rerender once we have new data
		$rootScope.$broadcast('ngbsm.new_graph_loaded');
	});
};

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
					_loading(rootId, selectedItem);
				}
			}
			]
	};
	$rootScope.$broadcast('ngbsm.open_bsm_dialog', dialogConfig);
}

function expand() {
	// Focus and fetch data for the selected CI, passing a list of sys_id's for nodes
	// inside the group to prevent them from being collapsed
	var id = bsmGraph.current().root.id;


	//Need to send a warnning (the sate probably will be lost), in case the graph was changed already by other action (e.g. loadMore)
	if (graphWasChanged){
		_showConfirmationDialog(id , item);		
	} else {
		_loading(id , item);
	}			
}
expand();	
	
	
