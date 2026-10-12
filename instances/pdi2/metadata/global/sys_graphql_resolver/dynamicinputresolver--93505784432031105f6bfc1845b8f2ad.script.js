(function process(/*ResolverEnvironment*/ env) {
	var args = env.getArguments();
	var isSubflow = args.isSubflow;
	var flowOrActionId = args.flowOrActionId;
	var inputName = args.inputName;
	
	var dynamicInfo = JSON.parse(sn_flow.FlowDesigner.getDynamicInfoObject(flowOrActionId, inputName, !isSubflow));
	return dynamicInfo;
})(env);
