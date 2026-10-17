(function refineQuery(current, parent) {

    current.addQuery('attr_scope_table', parent.getTableName());
    current.addQuery('attr_scope', parent.getUniqueValue());

})(current, parent);
