(function executeQuery(v_table, v_query) {
    const rows = new CloudEntitlementInstanceTableProvider().getRows();
	rows.forEach(row => {
        v_table.addRow(row);
    });
})(v_table, v_query);
