(function process( /*ResolverEnvironment*/ env) {
    const {
        activityId,
        config
    } = env.getArguments();
    const gr = new GlideRecord(PADConstants.TABLES.PD_ACTIVITY);
    gr.get(activityId);
    if (!gr.canRead()) {
        return PADConstants.UnauthorizedError;
    }

    try {
        return new PDActivityService().getActivity(activityId, config);
    } catch (err) {
        return {
            errorType: 'QUERY_FAILED',
            message: err
        };
    }
})(env);
