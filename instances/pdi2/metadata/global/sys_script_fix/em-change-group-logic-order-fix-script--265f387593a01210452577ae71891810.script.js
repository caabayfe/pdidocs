gs.info("Executing script EM - Change group logic order");
var gr = new GlideRecord("sys_properties");
gr.addQuery("name", "sa_analytics.agg.query.group_logic_order");
gr.query();
var isValueSet = false;
while (gr.next()) {
    if (gr.getValue("sys_updated_by") !== 'admin') {
        changedValue = gr.getValue("value");
        isValueSet = true;
        gs.info("The property sa_analytics.agg.query.group_logic_order was created before the upgrade and has the value" + changedValue);
        break;
    }
}
if (isValueSet) {
    var logicOrderGr = new GlideRecord("sys_properties");
    if (logicOrderGr.get("9950d65e77230210034fef00af5a9932")) {
        logicOrderGr.setValue("value", changedValue);
        if (logicOrderGr.update()) {
            gs.info("The property sa_analytics.agg.query.group_logic_order exists already, setting the new property to value " + changedValue);
        }
    }

} else if (isNewInstance()) {
    var orderGr = new GlideRecord("sys_properties");
    if (orderGr.get("9950d65e77230210034fef00af5a9932")) {
        orderGr.setValue("value", "CMDB,NETWORK_TRAFFIC,TAG_BASED,PATTERN,GENERALIZED_PATTERNS,TEXTBASE");
        if (orderGr.update()) {
            gs.info("Setting property sa_analytics.agg.query.group_logic_order with value CMDB,NETWORK_TRAFFIC,TAG_BASED,PATTERN,GENERALIZED_PATTERNS,TEXTBASE");
        }
    }
} else {
    gs.info("OOB property sa_analytics.agg.query.group_logic_order remains unchanged");
}
gs.info("finished executing the script EM - Change group logic order");

function isNewInstance() {
    var alertGr = new GlideRecord('em_alert');
    if (!alertGr.isValid()) {
        // table doesn't exist, must be new instance
        return true;
    }
    alertGr.setLimit(10);
    alertGr.query();
    return alertGr.getRowCount() < 10; // more than 10 alerts means it's an existing customer
}
