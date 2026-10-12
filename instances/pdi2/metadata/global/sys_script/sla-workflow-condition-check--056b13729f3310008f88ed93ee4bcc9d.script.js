abortConditionsOnSLAWorkflows();

function abortConditionsOnSLAWorkflows() {
	if (!SLAvalidation.workflowConditionEmpty(current.workflow, current.condition_type, current.condition)) {
	  gs.addErrorMessage(gs.getMessage("SLA Workflows should not specify conditions"));
	  current.setAbortAction(true);
   }
}
