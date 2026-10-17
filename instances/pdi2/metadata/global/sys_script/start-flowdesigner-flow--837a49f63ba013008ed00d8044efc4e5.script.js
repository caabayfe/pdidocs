startFlowDesignerFlow(current);

function startFlowDesignerFlow(current) {
	var flow = current.cat_item.flow_designer_flow;
	var flowName = flow.sys_scope.scope + "." + flow.internal_name;

	sn_flow_trigger.FlowTriggerAPI.fireCatalogTrigger(flowName, current); 
}
