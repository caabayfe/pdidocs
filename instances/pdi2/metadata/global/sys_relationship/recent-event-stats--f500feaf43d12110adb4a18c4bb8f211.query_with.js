(function refineQuery(current, parent) {
    current.addQuery('event', parent.event_name);
    current.addQuery('queue', parent.queue ? parent.queue : 'DEFAULT');
    current.orderByDesc('interval_end');
    current.setLimit(10);
})(current, parent);
