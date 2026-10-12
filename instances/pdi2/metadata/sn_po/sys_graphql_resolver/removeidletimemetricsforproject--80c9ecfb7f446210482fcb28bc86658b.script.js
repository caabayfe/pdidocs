(function process( /*ResolverEnvironment*/ env) {

    var params = {
        "payload": env.getArguments()['payload'],
    };
    return new sn_po.ProminProjectDefUtil().removeIdleTimeMetricsForProject(params.payload);

})(env);
