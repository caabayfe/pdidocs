(function executeRule(current, previous /* null when async */) {
	var assetField = current.getValue('asset_field');
	var ciField = current.getValue('configuration_item_field');
	var gr = new GlideRecord('alm_asset_ci_field_mapping');
	gr.addQuery('asset_field', assetField)
		.addOrCondition('configuration_item_field', ciField);
	gr.query();
	while (gr.next()) {
		if (gr.getValue('asset_field') === assetField
            && gr.getValue('configuration_item_field') === ciField) {
			gs.addErrorMessage(gs.getMessage('Mapping for Asset/Configuration item fields already exists.'));
			current.setAbortAction(true);
			break;
		} else if (gr.getValue('active') === '1') {
			if (gr.getValue('asset_field') === assetField) {
				gs.addErrorMessage(gs.getMessage('Active mapping for Asset field already exists.'));
			} else {
				gs.addErrorMessage(gs.getMessage('Active mapping for Configuration item field already exists.'));
			}
			current.setAbortAction(true);
			break;
		}
	}
}(current, previous));
