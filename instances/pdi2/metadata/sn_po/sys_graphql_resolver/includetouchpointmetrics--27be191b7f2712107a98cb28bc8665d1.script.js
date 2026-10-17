(function process( /*ResolverEnvironment*/ env) {

    var params = {
        "payload": env.getArguments()['payload'],
    };
    return new sn_po.ProminProjectDefUtil().includeTouchPointMetrics(params.payload);

})(env);
