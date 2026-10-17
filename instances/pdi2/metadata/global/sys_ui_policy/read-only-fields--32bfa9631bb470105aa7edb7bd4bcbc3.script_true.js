// Set not empty fields to be readonly
// Most of fields are readonly except of Severity, State, Ack, KB, Maintanance, Parent, Feedback, Task 

function onCondition() {
	g_form.setReadOnly('source', g_form.getValue('source') != '');
	g_form.setReadOnly('node', (g_form.getValue('node') != '') || (g_form.getValue('cmdb_ci') != ''));
	g_form.setReadOnly('type', g_form.getValue('type') != '');
	g_form.setReadOnly('resource', g_form.getValue('resource') != '');
	
	g_form.setReadOnly('cmdb_ci', g_form.getValue('cmdb_ci') != '');
	
	g_form.setReadOnly('metric_name', g_form.getValue('metric_name') != '');
	g_form.setReadOnly('description', g_form.getValue('description') != '');
	g_form.setReadOnly('message_key', g_form.getValue('message_key') != '');
	
	g_form.setReadOnly('additional_info', g_form.getValue('additional_info') != '');
	
	g_form.setReadOnly('sys_updated_on', g_form.getValue('sys_updated_on') != '');
	g_form.setReadOnly('sys_created_on', g_form.getValue('sys_created_on') != '');
	
	g_form.setDisplay('short_description', false);
}
