/**
 * Form Controller's Internal Event Mappings to this client script is conditional, the following 3 conditions must be satisifed 
 * 1. event.payload.sourceAction.payload.popoverElementId === 'reference_info_popover'
 * 2. !!event.payload.sourceAction.payload.popoverTriggerElement
 * 3. !!api.state.popoverNavigation.payload
 */
function script({api, event}) {
	const payload = api.state.popoverNavigation.payload;
	api.setState('popoverNavigation', null);

	const {
		popoverTriggerElement: actionTarget
	} = event.payload.sourceAction.payload;

	const getModel = elem => {
		if (!elem)
			return {};
		const model = elem.getProperty('model');
		return model || getModel(elem.getRootNode()?.host);
	};

	const {
		referenceSysId: sysId,
		referenceTable: table,
		fieldName,
		dictionary
	} = getModel(actionTarget);

	if (dictionary && dictionary.type !== "reference")
		return;

	if (sysId && table && fieldName)
		api.emit('RECORD#NAV_ITEM_SELECTED',  {...payload, fieldName, fields: {sysId, table}});
}
