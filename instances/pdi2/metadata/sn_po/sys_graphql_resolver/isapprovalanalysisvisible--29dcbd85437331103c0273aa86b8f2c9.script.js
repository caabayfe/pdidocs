(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
		sourceType: env.getArguments()['sourceType'],
    };
    return new sn_po.ProminProjectDefUtil().isApprovalAnalysisVisible(params.table, params.sourceType);
})(env);
