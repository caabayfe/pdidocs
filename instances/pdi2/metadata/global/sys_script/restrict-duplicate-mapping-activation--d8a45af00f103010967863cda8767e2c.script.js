(function executeRule(current, previous /* null when async */) {
	var assetField = current.getValue('asset_field');
	var ciField = current.getValue('configuration_item_field');
	var gr = new GlideRecord('alm_asset_ci_field_mapping');
	gr.addActiveQuery('active');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('asset_field', assetField)
		.addOrCondition('configuration_item_field', ciField);
	gr.query();
	if (gr.next()) {
		if (gr.getValue('asset_field') === assetField
            && gr.getValue('configuration_item_field') === ciField) {
			gs.addErrorMessage(gs.getMessage('Active mapping for Asset/Configuration item fields already exists.'));
		} else if (gr.getValue('asset_field') === assetField) {
			gs.addErrorMessage(gs.getMessage('Active mapping for Asset field already exists.'));
		} else {
			gs.addErrorMessage(gs.getMessage('Active mapping for Configuration item field already exists.'));
		}
		current.setAbortAction(true);
	}
}(current, previous));
