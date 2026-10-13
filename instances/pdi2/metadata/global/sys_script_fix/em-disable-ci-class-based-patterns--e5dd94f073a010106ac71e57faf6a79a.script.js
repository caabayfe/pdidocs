gs.log("Run 'EM - Disable CI class based patterns' fix script after EM upgrade.");
//Generalized Patterns are part of Alert Grouping improvements introduced in Paris.
var EM_analytics_generalized_patterns_enabled = "sa_analytics.generalized_patterns_enabled";

var propertiesGr = new GlideRecord('sys_properties');
propertiesGr.addQuery("name", EM_analytics_generalized_patterns_enabled);
propertiesGr.query();
if (propertiesGr.next()) {
    var propertyValue = propertiesGr.getValue("value");
    gs.log("'EM - Disable CI class based patterns': sa_analytics.generalized_patterns_enabled property value is " + propertyValue);
    if (propertyValue == "true") {
        //check whether this is an existing customer
        var evtMgmtCommons = new EvtMgmtCommons();
        if (!evtMgmtCommons.isNewInstance()) { //existing customer, disable the property
            gs.log("'EM - Disable CI class based patterns': em_alert table has at least 10 records");
            propertiesGr.setValue("value", false);
            propertiesGr.update();
            gs.log("Disabling '" + EM_analytics_generalized_patterns_enabled + "' property for non zboot customers");

        }
    }
}

gs.log("Finish to run 'EM - Disable CI class based patterns' fix script after EM upgrade.");
