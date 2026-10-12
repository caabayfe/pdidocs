(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var data = new sn_nlu_workbench.NLUCoreUtils.getSuportedLanguages(args.releaseFeature);
        return {
            status: 'success',
            data: data
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
