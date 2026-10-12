(function process( /*ResolverEnvironment*/ env) {
    var params = {
        tableNames: env.getArguments()['tableNames'],
    };
    return new sn_po.ProminProjectDefUtil().isSlaBreachVisible(params.tableNames);
})(env);
