(function() {
	var gr = new GlideRecord('sys_dictionary');
	if (!gr.isValid()) { return; }

	// Query for the ast_contract table and the specific fields
	gr.addQuery('name', 'ast_contract');
	gr.addQuery('element', 'monthly_cost').addOrCondition('element', 'yearly_cost');
	gr.query();

	gs.info('Setting default value to 0 for monthly_cost & yearly_cost fields of ast_contract');

	while (gr.next()) {
		// Check if the field already has default_value set
		var defaultValue = gr.getValue('default_value');
		if (gs.nil(defaultValue)) {
			// If no default_value is set, set it to 0
			gr.setValue('default_value', '0');
			gr.update();
		}
	}
}());
