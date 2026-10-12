(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        return {
            status: 'success',
            data: global.NLULabelFeedbackUtil.saveLabelFeedback(args.nluData, args.feedback, args.options)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
