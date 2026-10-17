(function process( /*ResolverEnvironment*/ env) {
    var params = {
        projectId: env.getArguments()['projectId'],
    };
    return new sn_po.ProminProjectDefUtil().isScopeStageEnabled(params.projectId);
})(env);
