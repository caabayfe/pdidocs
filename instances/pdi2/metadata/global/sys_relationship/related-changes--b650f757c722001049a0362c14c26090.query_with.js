(function refineQuery(current, parent) {
    var alertId = parent.getUniqueValue();

    // For secondary alerts, fetch records by the primary alert (parent) of the record.
    if (parent.getValue('parent')) {
        alertId = parent.getValue('parent');
    }

    current.addQuery('parent_alert', alertId);
    current.addNotNullQuery('root_cause_task');
})(current, parent);
