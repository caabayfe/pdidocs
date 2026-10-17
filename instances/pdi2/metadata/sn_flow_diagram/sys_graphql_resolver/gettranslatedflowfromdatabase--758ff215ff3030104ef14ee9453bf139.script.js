(function process(/*ResolverEnvironment*/ env) {

	// implement data resolver here
	var flowSysId = env.getArguments().flowSysId;
	var errors = [];
	var data;
	try {
		data =  FlowDiagramBuilderApi.getTranslatedFlowFromDatabase(flowSysId, errors);
		data = JSON.stringify(data);
	} catch (e) {
		errors.push(e);
	}
	
	return {
		data: data,
		errors: errors
	};

})(env);
