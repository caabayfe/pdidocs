(function process( /*ResolverEnvironment*/ env) {
    var params = {
        sysId: env.getArguments()['sysId'],
        findingPayload: env.getArguments()['findingPayload'],
    };
    var payload = JSON.parse(params.findingPayload);
    return new sn_po.ProminFindingsDefUtil().updateProminAutomatedFinding(params.sysId, payload);
})(env);
