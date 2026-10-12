(function process( /*ResolverEnvironment*/ env) {
    var params = {
        findingClass: env.getArguments()['findingClass'],
		findingClassId: env.getArguments()['findingClassId'],
    };
    return new sn_po.ProminFindingsDefUtil().getRuleBasedFindingFields(params.findingClass, params.findingClassId);
})(env);
