(function executeQuery(v_table, v_query) {

    const subscription = v_query.getParameter("subscription");
    const licenseFamily = v_query.getParameter("subscription_family");

    const dao = new sn_entitlement.SubscriptionApplicationFamilyDao();
    var rows = dao.getData(subscription, licenseFamily);
    rows.forEach(row => v_table.addRow(row));

})(v_table, v_query);
