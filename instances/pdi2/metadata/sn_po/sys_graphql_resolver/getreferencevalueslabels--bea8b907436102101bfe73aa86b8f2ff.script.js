(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
        values: env.getArguments()['values'],
        field: env.getArguments()['field'],
    };
    return new sn_po.ProminFindingsDefUtil().getReferenceValuesLabels(params.table, params.values, params.field);
})(env);
