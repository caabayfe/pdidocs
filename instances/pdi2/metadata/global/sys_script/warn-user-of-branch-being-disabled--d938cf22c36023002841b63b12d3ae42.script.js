(function executeRule(current, previous /*null when async*/) {
	if (current.answer == "")
		return;
	
	var decisions = new GlideRecord("sys_decision_question");
	decisions.addQuery("decision_table", current.decision_table);
	decisions.addQuery("answer", current.answer);
	decisions.addQuery("sys_id", "!=", current.sys_id);
	decisions.query();
	if (decisions.next())
		return;
	
	var flowLogic = new GlideRecord("sys_hub_flow_logic");
	flowLogic.addQuery("flow.sys_class_name", "sys_hub_flow");
    flowLogic.addQuery("logic_definition", "b1f542d673331300612c273ffff6a7c7");
	flowLogic.query();
	var flows = [];
	var message = "";
	while (flowLogic.next()) {
		if (flowLogic.inputs.answer != current.answer)
            continue;

		if (flows.indexOf(flowLogic.flow + "") == -1) {
			flows.push(flowLogic.flow + "");
			message += GlideStringUtil.escapeHTML(flowLogic.flow.name) + ", ";
		}
	}
	
	if (message.length > 1) 
		message = message.substring(0, message.length - 2);
	
	var answer =  GlideStringUtil.escapeHTML(current.answer.name);
	if (flows.length > 1) {
		gs.addInfoMessage(
			gs.getMessage("The question deleted contained the only occurrence of the answer {0} in the decision table, and it was used in these flows: {1}. Decision branches with this answer will no longer be taken.", [answer, message])
		);   
	} else if (flows.length == 1) {
		gs.addInfoMessage(
			gs.getMessage("The question deleted contained the only occurrence of the answer {0} in the decision table, and it was used in the flow {1}. Decision branches with this answer will no longer be taken.", [answer, message])
		);  
	}

})(current, previous);
