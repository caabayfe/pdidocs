(function executeRule(current, previous /*null when async*/ ) {

    var canRouteToEMS = SNC.UsageAnalyticsScriptUtils.canRouteToEMS();
    // find and update the ua_custom_table_inventory records with the new license value
    var gr = new GlideRecord('ua_custom_table_inventory');
    gr.addQuery('table_ref.sys_scope', current.sys_id);
    gr.query();
    while (gr.next()) {
        if (canRouteToEMS) {
            gr.subscription_entitlement = current.subscription_entitlement;
        } else {
            gr.license = current.license;
        }
        gr.update();
    }

})(current, previous);
