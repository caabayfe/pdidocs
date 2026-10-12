(function process(/*ResolverEnvironment*/ env) {
    var params = {
        sysId: env.getArguments()['sysId'],
        breakdownPayload: env.getArguments()['breakdownPayload'],
    };
    var payload = JSON.parse(params.breakdownPayload);
    return new sn_po.ProminProjectDefUtil().updateProminBreakdown(params.sysId, payload);
})(env);
