(function process(/*ResolverEnvironment*/ env) {
   var params = {
        tableName: env.getArguments()['tableName'],
        field: env.getArguments()['field'],
    };
    return new sn_po.ProminProjectDefUtil().getProminActivityFieldDetails(params);
})(env);
