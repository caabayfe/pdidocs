(function process( /*ResolverEnvironment*/ env) {
    var params = {
        sourceType: env.getArguments()['sourceType'],
        includeExternalData: env.getArguments()['includeExternalData'],
        excludeNonAuditedTables: env.getArguments()['excludeNonAuditedTables'],
    };
    return new sn_po.ProminProjectDefUtil().getProminAllowedTables(params.sourceType, params.includeExternalData, params.excludeNonAuditedTables);
})(env);
