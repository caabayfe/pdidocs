(function process( /*ResolverEnvironment*/ env) {
    var params = {
        findingDefId: env.getArguments()['findingDefId'],
    };
    return new sn_po.ProminFindingsDefUtil().getFindingRulesAndConstraints(params.findingDefId);
})(env);
