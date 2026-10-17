function script({ api, event, helpers, imports }) {
	//showRemoveConnectionDialog script in Map Search Filter UI Controller; fired when:
	// 1) the CONTEXT_MENU_ITEM_CLICKED event is passed in with id="removeConnection" and type="edge"
	// 2) the "Remove" button is clicked on the CI connection card in attributes panel

	//NOTE: the OOB open modal handler does not work in controllers; but the helpers.modal.open api does
	helpers.modal.open("[component-id$='remove_connection']", { options: {} });
	var edge = event.payload.edge;

	//NOTE: need to workaround COE bug where their event serves up a node object prop when an edge is clicked 
	//  however, the node object contains edge props so we can work with it until the defect if fixed
	//  (DEF0625088, DEF0632561)
	if (!edge && event.payload.node.sourceId) {
		edge = event.payload.node;
	}

	api.setState('edgeToRemove', edge);
}
