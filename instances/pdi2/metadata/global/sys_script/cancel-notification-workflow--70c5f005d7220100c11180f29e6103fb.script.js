cancelRunningFlow();

function cancelRunningFlow() {
	//Workflow code snippet is kept for backward compatability
	var workflow;
	workflow = new Workflow();
	workflow.getWorkflowFromName('Notify assessment user');
	workflow.cancel(current);
	
	if (current.notification_flow_context_id && !current.notification_flow_context_id.nil())
        new sn_fd.FlowAPI.cancel(current.notification_flow_context_id, "Subflow is canceled because of either State change or instance deletion in assessment instance");
}
