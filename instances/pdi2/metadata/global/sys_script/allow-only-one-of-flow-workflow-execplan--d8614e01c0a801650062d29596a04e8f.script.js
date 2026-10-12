// If flow is specified, clear out the workflow, execution plan since we can have only one
if (!current.flow_designer_flow.nil()) {
	current.workflow = '';
	current.delivery_plan = '';
} else if (!current.workflow.nil()) {
	// If workflow is specified, clear out the execution plan since we can have only one
	current.delivery_plan = '';
}
