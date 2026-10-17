(function process( /*ResolverEnvironment*/ env) {
    var params = {
        sourceType: env.getArguments()['sourceType'],
		searchTerm: env.getArguments()['searchTerm'],
    };
    return new sn_po.ProminProjectDefUtil().getTableList(params.sourceType, params.searchTerm);
})(env);
