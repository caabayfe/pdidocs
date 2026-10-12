(function executeRule(current, previous /* null when async */) {
	var assetField = current.getValue('asset_field');
	var gr = new GlideRecord('alm_asset_ci_field_mapping');
	gr.addQuery('asset_field', assetField);
	gr.addActiveQuery('active');
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Active mapping for Asset field already exists.'));
		current.setAbortAction(true);
	}
}(current, previous));
