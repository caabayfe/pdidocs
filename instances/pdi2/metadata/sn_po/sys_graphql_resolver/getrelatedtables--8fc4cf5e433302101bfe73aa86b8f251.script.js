(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
        searchTerm: env.getArguments()['searchTerm'],
    };
    return new sn_po.ProminProjectDefUtil().getRelatedTables(params.table, params.searchTerm);
})(env);
