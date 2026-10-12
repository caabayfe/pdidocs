function setCostAdjustmentDefaultValue() {
	var rec = new GlideRecord('sys_dictionary');
	rec.addQuery('name', 'ast_contract');
	rec.addQuery('element', 'cost_adjustment');
	rec.setValue('default_value', '0');
	rec.updateMultiple();
}
setCostAdjustmentDefaultValue();
