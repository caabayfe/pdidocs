function script({ api, event, helpers, imports }) {
	//showRemoveNodeDialog script in Map Search Filter UI Controller; fired when:
	// 1) the CONTEXT_MENU_ITEM_CLICKED event is passed in with id="remove" and type="node"
	// 2) the "Remove" node button is clicked on the CI card in attributes panel

	//NOTE: the OOB open modal handler does not work in controllers; but the helpers.modal.open api does
	helpers.modal.open("[component-id$='remove_node']", { options: {} });
	api.setState('nodeToRemove', event.payload.node);
}
