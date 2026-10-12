(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "trackerId": env.getArguments()['usersCollectorTaskIdentifier'],
    };
    return new sn_po.ProminTaskMiningDefUtil().getTaskMiningProjectDetails(params.trackerId);
})(env);
