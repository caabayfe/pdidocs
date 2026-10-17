(function process( /*ResolverEnvironment*/ env) {
    var params = {
		"sysId": env.getArguments()['sysId'],
        "findingPayload": env.getArguments()['findingPayload'],
    };
    var payload = JSON.parse(params.findingPayload);
    return new sn_po.ProminFindingsDefUtil().updateRuleBasedFinding(params.sysId, payload);
})(env);
