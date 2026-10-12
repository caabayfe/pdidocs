(function executeRule(current, previous /*null when async*/ ) {
    var resolverAggregate = new GlideAggregate('sys_graphql_typeresolver');
    resolverAggregate.addQuery('schema', current.schema);
    resolverAggregate.addQuery('type_name', current.type_name);
    resolverAggregate.addQuery('sys_id', '!=', current);
    resolverAggregate.addAggregate('count');
    resolverAggregate.query();

    if (resolverAggregate.next() && resolverAggregate.getAggregate('count') > 0) {
		gs.addErrorMessage(gs.getMessage('Resolver already defined for {0} type. Only one resolver can be defined for a type.', GlideStringUtil.escapeHTML(current.type_name)));
        current.setAbortAction(true);
    }
})(current, previous);
