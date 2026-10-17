(function process( /*ResolverEnvironment*/ env) {
    try {
        if (!gs.hasRole('nlu_admin')) throw new Error(gs.getMessage("User doesn't have access to perform this operation"));
        var args = env.getArguments();
        var translator = new global.NLUModelTranslator(args.modelId, args.language);
        return translator.translate(args.mode);
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
