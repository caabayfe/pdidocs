(function process(/*ResolverEnvironment*/ env) {
    var params = {
        projectId: env.getArguments()['projectId'],
    };
    return new sn_po.ProminProjectDefUtil().copyProminProject(params.projectId);
})(env);
