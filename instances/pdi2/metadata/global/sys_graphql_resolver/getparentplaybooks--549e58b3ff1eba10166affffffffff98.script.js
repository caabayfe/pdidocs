(function process( /*ResolverEnvironment*/ env) {
    var gr = new GlideRecord(PADConstants.TABLES.PD_PROCESS_DEFINITION);
    var processId = env.getArguments().processDefinitionId;
    gr.get(processId);
    if (!gr.canRead()) {
        return PADConstants.UnauthorizedError;
    }

    try {
        return new PDProcessDefinitionService().getParentPlaybooks(
            processId
        );
    } catch (err) {
        return {
            errorType: 'QUERY_FAILED',
            message: err
        };
    }
})(env);
