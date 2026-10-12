(function executeRule(current, previous /*null when async*/) {
	//
	// explicitly handle the common error case of parent and child in same taxonomy node
	// to be able to give more helpful error messages to a user
	//
	var parentTaxonomyLayer = current.parent.spm_taxonomy_layer;
	var currentTaxonomyLayer = current.spm_taxonomy_layer;
	var currentTaxonomyLayerLabel = currentTaxonomyLayer.getLabel().toLowerCase();
	
	if (parentTaxonomyLayer && currentTaxonomyLayer && 
		parentTaxonomyLayer.getValue('sys_id') === currentTaxonomyLayer.getValue('sys_id')) {
		
		gs.addErrorMessage(gs.getMessage('This child node cannot exist in the same {0} as its parent node',[
			currentTaxonomyLayerLabel
		]));
		current.setAbortAction(true);
		return;
	}
	
	// 
	// Ensure that the taxonomy layer for new node must be the immediate layer 
	// sequentially after the new node's parent layer 
	//
	var parentLayerOrder = parentTaxonomyLayer.order;

	var gr = new GlideRecord('spm_taxonomy_layer_definition');
	gr.orderBy('order');
	gr.setLimit(1);
	gr.addQuery('order', '>', parentLayerOrder);
	gr.addQuery('spm_service_portfolio', current.spm_service_portfolio);
	gr.query();
	
	// The first result should be the layer right after the parent's layer
	if (!gr.next()){
		gs.addErrorMessage(gs.getMessage('There is no sequential {0}',[
			currentTaxonomyLayerLabel
		]));
		current.setAbortAction(true);
		return;
	}
	
	var currentLayerId = currentTaxonomyLayer.getValue('sys_id');
	var nextLayerFromParentId = gr.getValue('sys_id');
	
	if (currentLayerId != nextLayerFromParentId){
		gs.addErrorMessage(gs.getMessage('This node\'s {0} and its\' parent node\'s {1} are not in sequence', [
			currentTaxonomyLayerLabel,
			currentTaxonomyLayerLabel
		]));
		current.setAbortAction(true);
	}
		

})(current, previous);
