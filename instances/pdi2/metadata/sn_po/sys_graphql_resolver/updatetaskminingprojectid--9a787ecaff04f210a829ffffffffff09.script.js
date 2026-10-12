(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "usersCollectorTaskIdentifier": env.getArguments()['usersCollectorTaskIdentifier'],
        "taskMiningProjectId": env.getArguments()['taskMiningProjectId'],
    };
    return new sn_po.ProminTaskMiningDefUtil().updateTaskMiningProjectId(params.usersCollectorTaskIdentifier, params.taskMiningProjectId);
})(env);
