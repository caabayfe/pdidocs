var gr = new GlideRecord('sys_dictionary');
gr.addQuery('element', 'execution_state');
gr.addQuery('name', 'cmdb_data_management_policy_execution');
gr.query();
if (gr.next()) {
	gr.setValue('display', false);
	gr.update();
}
