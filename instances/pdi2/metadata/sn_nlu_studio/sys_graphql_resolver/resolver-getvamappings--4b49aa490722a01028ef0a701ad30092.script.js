(function process( /*ResolverEnvironment*/ env) {

    try {
        return {
            status: 'success',
            data: global.NLUMappingsUtil.getVAMappings()
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
