(function refineQuery(current, parent) {

    current.addQuery('consumer_id', parent.getUniqueValue());
    current.addQuery('consumer_table', parent.getTableName());

})(current, parent);
