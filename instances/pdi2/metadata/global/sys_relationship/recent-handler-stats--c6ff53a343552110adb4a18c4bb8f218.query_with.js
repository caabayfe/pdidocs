(function refineQuery(current, parent) {
    current.addQuery('handler_id', parent.sys_id);
    current.orderByDesc('interval_end');
    current.setLimit(10);
})(current, parent);
