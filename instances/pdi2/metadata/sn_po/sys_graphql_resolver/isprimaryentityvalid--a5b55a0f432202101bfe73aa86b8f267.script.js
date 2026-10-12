(function process( /*ResolverEnvironment*/ env) {
    var params = {
        tableName: env.getArguments()['tableName'],
    };
    return new sn_po.ProminProjectDefUtil().isPrimaryEntityValid(params.tableName);
})(env);
