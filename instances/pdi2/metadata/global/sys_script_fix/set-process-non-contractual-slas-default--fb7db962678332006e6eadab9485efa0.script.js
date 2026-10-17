var defaultValue;
// get default value
var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'ast_contract');
gr.addQuery('element', 'process_non_contractual_slas');
gr.query();
if (gr.next())
	defaultValue = gr.getValue('default_value');
// set default value to existing contracts
if (!JSUtil.nil(defaultValue)){
	var slaGr = new GlideRecord('ast_contract');
	slaGr.setValue('process_non_contractual_slas', defaultValue);
	slaGr.updateMultiple();
}
