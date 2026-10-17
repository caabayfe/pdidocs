(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        var modelLookupsGr = new global.NLUModel(args.modelId).getLookups();
        return {
            status: 'success',
            count: modelLookupsGr.getRowCount()
        };
    } catch (e) {
        return {
            status: 'failure',
            error: e.message
        };
    }
})(env);
