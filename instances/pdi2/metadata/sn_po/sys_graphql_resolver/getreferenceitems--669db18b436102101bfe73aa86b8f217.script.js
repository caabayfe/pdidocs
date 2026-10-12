(function process( /*ResolverEnvironment*/ env) {
    var table = env.getArguments()['table'];
    var searchTerm = env.getArguments()['searchTerm'];
    var limit = env.getArguments()['limit'];
    var queryConditions = env.getArguments()['queryConditions'];
    var matchStrategy = env.getArguments()['matchStrategy'];
    var field = env.getArguments()['field'];

    return new sn_po.ProminFindingsDefUtil().getReferenceItems(table, searchTerm, limit, queryConditions, matchStrategy, field);
})(env);
