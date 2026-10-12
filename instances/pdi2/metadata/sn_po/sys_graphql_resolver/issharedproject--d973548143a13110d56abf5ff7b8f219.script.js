(function process( /*ResolverEnvironment*/ env) {
    var params = {
        projectId: env.getArguments()['projectId'],
    };
    var grProject = new GlideRecordSecure('promin_project');
    if (!grProject.get(params.projectId)) {
        grProject.newRecord();
    }
    return new sn_po.ProminProjectDefUtil().isSharedProject(grProject);
})(env);
