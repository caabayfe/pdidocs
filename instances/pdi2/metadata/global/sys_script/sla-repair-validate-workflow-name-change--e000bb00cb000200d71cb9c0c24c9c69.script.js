changeSLARepairWorkflowName();

function changeSLARepairWorkflowName() {
	if (!SLARepairProperties.validateWorkflowName(current.value))
		current.setAbortAction(true);
}
