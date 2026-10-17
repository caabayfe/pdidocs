(function executeQuery(v_table, v_query) {
    const rows = new SMv2GenAIInstancesTableProvider(sn_entitlement.LicensingEngineConstants.ASSIST).getRows();
    rows.forEach(row => {
        v_table.addRow(row);
    });
})(v_table, v_query);
