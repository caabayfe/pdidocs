gs.info("Executing the EM - Enable network traffic correlation script");

var propertyName = "sa_analytics.agg.query_network_traffic_correlation_enabled";
var gr = new GlideRecord("sys_properties");
gr.addQuery("name", propertyName);
gr.query();
if (gr.next()) {
    if (gr.getValue("sys_updated_by") !== 'admin') {
        //the customer changed the property - not changing it
        changedValue = gr.getValue("value");
        gs.info("The property " + propertyName + " was created before the upgrade and has the value" + changedValue + ". It will not be changed.");
    } else {
        var val = "true";
        if (new global.EvtMgmtCommons().isNewInstance()) {
            //zbooted instance - enable the property
             gs.info("Enabling " + propertyName + " property for zbooted instance.");
        } else {
            //non zboot instance
            //disable the property
            val = "false";
            gs.info("Disabling " + propertyName + " property for non zbooted instance.");
        }
		gr.setValue(val);
        gr.update();
    }
}

gs.info("finished executing the EM - Enable network traffic correlation script");
