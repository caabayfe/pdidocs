(function executeQuery(v_table, v_query) {
    const entitlements = new AccountlevelEntitlementsProvider().getEntitlements();
    entitlements.forEach(entitlement => {
        v_table.addRow(entitlement);
    });
})(v_table, v_query);
