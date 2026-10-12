(function executeQuery(v_table, v_query) {
    var su = new SNSubscriptionUtils();
    populateVTable(su.getSubscriptionMetrics());
    populateVTable(su.getSubscriptionAllocatedMetrics());
    populateVTable(su.getUnmappedTable());

    function populateVTable(metrics) {
        for (var i = 0; i < metrics.length; i++) {
            v_table.addRow(metrics[i]);
        }
    }
})(v_table, v_query);
