(function process( /*ResolverEnvironment*/ env) {
    var params = {
        processId: env.getArguments()['processId'],
        excludeType: env.getArguments()['excludeType'],
        table: env.getArguments()['table'],
        filterQuery: env.getArguments()['filterQuery'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().saveExcludeDataFilters(params.processId, params.excludeType, params.table, params.filterQuery);

})(env);
