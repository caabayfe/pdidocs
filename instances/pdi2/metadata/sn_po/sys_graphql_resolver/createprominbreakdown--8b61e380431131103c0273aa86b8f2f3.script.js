(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "breakdownPayload": env.getArguments()['breakdownPayload'],
    };
    var payload = JSON.parse(params.breakdownPayload);
    return new sn_po.ProminProjectDefUtil().createProminBreakdown(payload);
})(env);
