(function executeRule(current, previous /*null when async*/) {

	var flowLogic = new GlideRecord("sys_hub_flow_logic");
	flowLogic.addQuery("flow.sys_class_name", "sys_hub_flow");
    flowLogic.addQuery("logic_definition", "b1f542d673331300612c273ffff6a7c7");
	flowLogic.query();
	var flows = [];
	var message = "";
	while (flowLogic.next()) {
		if (flowLogic.inputs.answer != current.sys_id)
            continue;

		if (flows.indexOf(flowLogic.flow + "") == -1) {
			flows.push(flowLogic.flow + "");
			message += flowLogic.flow.name + ", ";
		}
	}

	if (message.length > 1)
		message = message.substring(0, message.length - 2);

	if (flows.length > 1) {
		gs.addInfoMessage(
			gs.getMessage("Answer {0} was used in these flows: {1}. Decision branches with this answer will no longer be taken.", [current.name, message])
		);
	} else if (flows.length == 1) {
		gs.addInfoMessage(
			gs.getMessage("Answer {0} was used in the flow {1}. Decision branches with this answer will no longer be taken.", [current.name, message])
		);
	}
})(current, previous);
