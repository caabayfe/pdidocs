(function process(/*ResolverEnvironment*/ env) {
	var params = {
        tableName: env.getArguments()['tableName'],
        currentTableName: env.getArguments()['currentTableName'],
        entityId: env.getArguments()['entityId'],
    };
    return new sn_po.ProminProjectDefUtil().getProminAllowedColumnList(params);
})(env);
