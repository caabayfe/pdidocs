function onLoad() {
	var DEFAULT_PUBLISH_WORKFLOW = "fbe441019f112100d8f8700c267fcf1a";
	var DEFAULT_RETIRE_WORKFLOW = "3d18ef12c30031000096dfdc64d3aeb6";
	var DEFAULT_PUBLISH_FLOW = "2222030614f75210f8779da9137d35b3";
	var DEFAULT_RETIRE_FLOW = "ea32fac859c02210f877a8ba01addda2";


  if (!g_scratchpad.isKBWorkflowActive) {
      // Set default values for flow when workflow is not active
      if (g_form.isNewRecord()) {
          g_form.setValue('kb_publish_flow', DEFAULT_PUBLISH_FLOW);
          g_form.setValue('kb_retire_flow', DEFAULT_RETIRE_FLOW);
      }
      return;
  }

  // Check if the current form is a new record.
  // If both 'workflow' and 'flow' fields exist, set default values for the workflow.
  if (g_form.isNewRecord()) {
      g_form.setValue('workflow', DEFAULT_PUBLISH_WORKFLOW);
      g_form.setValue('retire_workflow', DEFAULT_RETIRE_WORKFLOW);
      return;
  }
	
	function getNumber(str){
		return typeof str === 'string' && str !== '' ? 1 : 0;
	}

	function canResetFlow(flow, workflow){
		flow = getNumber(flow);
		workflow = getNumber(workflow);
		return (flow & workflow);
	}

  var publishWorkflow = g_form.getValue('workflow');
  var publishFlow = g_form.getValue('kb_publish_flow');
  var retireWorkflow = g_form.getValue('retire_workflow');
  var retireFlow = g_form.getValue('kb_retire_flow');

	if(canResetFlow(publishFlow, publishWorkflow)){
		g_form.setValue('kb_publish_flow', '');
	}

	if(canResetFlow(retireFlow, retireWorkflow)){
		g_form.setValue('kb_retire_flow', '');
	}
}
