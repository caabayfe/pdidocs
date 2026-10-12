(function process(/*ResolverEnvironment*/ env) {
  var params = {
        table: env.getArguments()['table'],
        types: env.getArguments()['types'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().getTableColumns(params.table, params.types);
})(env);
