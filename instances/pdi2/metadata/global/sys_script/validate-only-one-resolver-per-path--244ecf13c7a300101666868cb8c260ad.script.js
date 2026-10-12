(function executeRule(current, previous /*null when async*/ ) {
    var resolverAggregate = new GlideAggregate('sys_graphql_resolver_mapping');
    resolverAggregate.addQuery('schema', current.schema);
    resolverAggregate.addQuery('path', current.path);
    resolverAggregate.addQuery('sys_id', '!=', current);
    resolverAggregate.addAggregate('count');
    resolverAggregate.query();

    if (resolverAggregate.next() && resolverAggregate.getAggregate('count') > 0) {
        gs.addErrorMessage(gs.getMessage('Mapping already defined for {0}. Only one resolver can be defined for a path.', GlideStringUtil.escapeHTML(current.path)));
        current.setAbortAction(true);
    }
})(current, previous);
