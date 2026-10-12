function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
       return;
	
	var sourceTable = g_form.getValue('source_type');
	if (sourceTable === 'sys_hub_flow')
		sourceTable = 'sys_hub_flow_base';
	
	var gr = new GlideRecord(sourceTable);
	gr.addQuery('sys_id', newValue);
	gr.query(checkIfDefinitionSourceIsActive);
}

function checkIfDefinitionSourceIsActive(gr) {
	if (!gr.next())
		return;
	
	var isNotActive;

	if (gr.getTableName() === 'sys_hub_flow_base')
		isNotActive = gr.active == 'false';
	else
		// actions are always marked as active, but am checking anyway in case that
		// changes. the status could be draft but there is still a published 
		// version, so check to see if a master snapshot exists.
		isNotActive = gr.active == 'false' || (gr.state === 'draft' && gr.master_snapshot === '');

	if (isNotActive) {
		g_form.addErrorMessage('You must select a Flow or Action that is active.');
		g_form.clearValue('source');
	} else
		g_form.clearMessages();
}
