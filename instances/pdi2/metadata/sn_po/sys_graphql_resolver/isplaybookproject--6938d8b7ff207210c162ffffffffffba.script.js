(function process(env) {
    var params = {
        versionId: env.getArguments()['versionId'],
        projectId: env.getArguments()['projectId']
    };
    return new sn_po.ProminProjectDefUtil().isPlaybookProject(params.versionId, params.projectId);
})(env);
