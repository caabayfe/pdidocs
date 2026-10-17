(function executeRule(current, previous /* null when async */) {
	var ciField = current.getValue('configuration_item_field');
	var gr = new GlideRecord('alm_asset_ci_field_mapping');
	gr.addQuery('configuration_item_field', ciField);
	gr.addActiveQuery('active');
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Active mapping for Configuration item field already exists.'));
		current.setAbortAction(true);
	}
}(current, previous));
