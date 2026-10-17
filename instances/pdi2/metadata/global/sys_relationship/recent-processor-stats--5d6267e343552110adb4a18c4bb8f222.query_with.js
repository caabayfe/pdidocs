(function refineQuery(current, parent) {
    current.addQuery('processor', parent.sys_id);
    current.orderByDesc('sys_updated_on');
    current.setLimit(10);
})(current, parent);
