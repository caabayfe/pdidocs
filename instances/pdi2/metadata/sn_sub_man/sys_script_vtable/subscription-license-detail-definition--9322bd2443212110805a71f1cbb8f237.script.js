(function executeQuery(v_table, v_query) {

    const subscriptionId = String(v_query.getParameter("subscription"));
    const type = v_query.getParameter("type");

    new sn_sub_man.SubscriptionLicenseDetailDefinitionProvider()
        .getData(subscriptionId, type)
        .forEach(row => v_table.addRow(row));

})(v_table, v_query);
