(function process(/*ResolverEnvironment*/ env) {
    var params = {
        processId: env.getArguments()['processId'],
        payload: env.getArguments()['payload'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().mutateProcessCategoryKPI(params.processId, params.payload);
})(env);
