(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        global.NLUMappingsUtil.saveMappipngs(args.mappings);
        return {
            status: 'success',
            message: gs.getMessage('Model group saved successfully')
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
