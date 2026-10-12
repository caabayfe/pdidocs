(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
        field: env.getArguments()['field'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().getTableColumnChoices(params.table, params.field);
})(env);
