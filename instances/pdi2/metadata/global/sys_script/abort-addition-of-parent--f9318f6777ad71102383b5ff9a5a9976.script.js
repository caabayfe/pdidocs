(function executeRule(current, previous /* null when async */) {
	var assetChildrenGr = AssetUtils.getAssetChildren(current.parent);
	while (assetChildrenGr.next()) {
		if (assetChildrenGr.model_component_id.toString() === current.model_component_id.toString()) {
			gs.addErrorMessage(gs.getMessage('Asset already exist with same model component'));
			current.setAbortAction(true);
		}
	}
	var allowUpdate = false;
	var modelComponentGr = new GlideRecord(AssetManagementConstants.MODEL_CLASSES.MODEL_COMPONENT);
	modelComponentGr.addQuery('sys_id', current.model_component_id);
	modelComponentGr.addQuery('parent', current.parent.model);
	modelComponentGr.query();
	if (modelComponentGr.next()) {
		var modelIds = AssetUtils.getSubModels(modelComponentGr.child);
		modelIds.push(modelComponentGr.getValue('child'));
		if (modelIds.indexOf(current.model.toString()) !== -1) {
			allowUpdate = true;
		}
	}
	if (!allowUpdate) {
		gs.addErrorMessage(gs.getMessage('Model component, parent asset and child asset details not matched'));
		current.setAbortAction(true);
	}
}(current, previous));
