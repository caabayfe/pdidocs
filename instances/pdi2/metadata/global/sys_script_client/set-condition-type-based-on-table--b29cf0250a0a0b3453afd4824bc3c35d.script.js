// Set the default condition_type based on the selected table
function onChange(control, oldValue, newValue, isLoading) {
   if (oldValue == newValue)
      return;
	
	var isPublished = g_form.getValue("wf_workflow_version.published");
	var condition = g_form.getValue("wf_workflow_version.condition_type");
	
   if (!isPublished && condition != null) {
   // task_sla and sc_req_item are 'none'
	   if (newValue == 'task_sla' || newValue == 'sc_req_item')
		  g_form.setValue('condition_type', '');
	}
}
