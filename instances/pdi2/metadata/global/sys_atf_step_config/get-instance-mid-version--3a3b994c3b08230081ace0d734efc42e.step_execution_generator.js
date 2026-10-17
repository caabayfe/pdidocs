// The outputs are a map of the variables defined in the outputs related list.
// The output of this script is mapped to the assigned_version variable.

(function executeStep(inputs, outputs, stepResult, timeout) {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', 'mid.version');
	gr.query();
	if (gr.next())
		stepResult.setSuccess();
	else
		stepResult.setFailed();
	outputs.assigned_version = gr.getValue('value');
}(inputs, outputs, stepResult, timeout));
