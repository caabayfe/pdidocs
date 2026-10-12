(function process( /*ResolverEnvironment*/ env) {
    var params = {
        findingConfigPayload: env.getArguments()['findingConfigPayload'],
    };
    var payload = JSON.parse(params.findingConfigPayload);
    return new sn_po.ProminFindingsDefUtil().updateProminAutomatedFindingConfig(payload);
})(env);
