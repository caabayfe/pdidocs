(function process( /*ResolverEnvironment*/ env) {
    var params = {
        projectId: env.getArguments()['projectId'],
        currentTableDisplayName: env.getArguments()['currentTableDisplayName'],
    };
    return new sn_po.ProminProjectDefUtil().getProjectDirtyMessage(params.projectId, params.currentTableDisplayName);
})(env);
