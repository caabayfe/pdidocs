(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        return {
            status: 'success',
            data: global.NLUTranslateUtil.getLfRequestedItemDetails(args.sysIds, args.languages)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
