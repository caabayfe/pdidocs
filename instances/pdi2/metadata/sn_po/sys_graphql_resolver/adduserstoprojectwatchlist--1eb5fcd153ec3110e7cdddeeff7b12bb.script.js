(function process(/*ResolverEnvironment*/ env) {

    var params = {
        "projectId": env.getArguments()['projectId'],
        "userIds": env.getArguments()['userIds']
    };
    return new sn_po.ProminProjectDefUtil().addUsersToProjectWatchList(params);

})(env);
