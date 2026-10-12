(function process(/*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        
		var query = 'query { NLU { nluProperties(language:' + args.language + ', version:"' + args.modelVersion +'", name:["batch_testing.max.model.count","batch_testing.max.test.utterance"]){ name,value } }}';
		
		var capabilityQuery = global.NLUParloIntegrator.getCapability(query);
		
		return {
			status: capabilityQuery.state,
			nluProperties: capabilityQuery.data.NLU.nluProperties
		};
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
