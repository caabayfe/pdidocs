(function process(/*ResolverEnvironment*/ env) {
    var actionIdMap = env.getArguments().actionIdMap;
    var actionProperties;
    var errors = [];
	
    try {
	actionProperties = FlowDiagramActionApi.getActionPropertyMap(actionIdMap, errors);
    } catch(e) {
	errors.push(e);
    }
	
    return {
	actionProperties: actionProperties,
	errors: errors
    };
})(env);
