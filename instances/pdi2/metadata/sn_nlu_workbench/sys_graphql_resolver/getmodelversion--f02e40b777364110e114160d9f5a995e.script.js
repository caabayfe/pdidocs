(function process(/*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        var nluModel = new global.NLUModel(args.modelId);
		var nluModelGr = nluModel.getGR();
		var parloIntegrator = new global.NLUParloIntegrator(nluModelGr);
		var result = parloIntegrator.getModelStatus();
		var solution = parloIntegrator.getSolution();
		var solutionVersion = solution.getVersion(result.trainedVersion);
		var solutionProps = JSON.parse(solutionVersion.getProperties());
		return solutionProps.authoringModel.version;
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
