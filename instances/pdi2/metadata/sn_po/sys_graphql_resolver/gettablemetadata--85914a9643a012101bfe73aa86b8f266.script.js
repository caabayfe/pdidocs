(function process(/*ResolverEnvironment*/ env) {
  var params = {
        table: env.getArguments()['table'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().getTableMetadata(params.table);
})(env);
