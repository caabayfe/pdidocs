(function executeQuery(v_table, v_query) {
    new SubscriptionOverviewProvider()
        .getData()
        .forEach(row => v_table.addRow(row));
})(v_table, v_query);
