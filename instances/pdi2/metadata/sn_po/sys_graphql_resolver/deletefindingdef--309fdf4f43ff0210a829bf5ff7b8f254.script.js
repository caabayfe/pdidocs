(function process( /*ResolverEnvironment*/ env) {
    var params = {
        findingIds: env.getArguments()['findingIds'],
		table: env.getArguments()['table']
    };
    return new sn_po.ProminProcessConfigurationDefUtil().deleteFindingDef(params.findingIds,params.table);
})(env);
