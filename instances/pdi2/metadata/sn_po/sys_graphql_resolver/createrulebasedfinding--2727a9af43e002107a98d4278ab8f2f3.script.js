(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "findingPayload": env.getArguments()['findingPayload'],
    };
    var payload = JSON.parse(params.findingPayload);
    return new sn_po.ProminFindingsDefUtil().createRuleBasedFinding(payload);
})(env);
