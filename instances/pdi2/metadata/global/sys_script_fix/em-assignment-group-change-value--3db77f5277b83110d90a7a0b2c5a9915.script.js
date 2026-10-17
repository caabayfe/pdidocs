var log = '';
log += "Run 'EM - enable auto-assignment group' fix script for new customers\n";

var EM_ALERT_AUTO_ASSIGNMENT_FIELD = "evt_mgmt.alert_auto_assignment_field";
var EM_ENABLE_GROUP_LEVEL_EVENT_RULES = "evt_mgmt.enable_group_level_event_rules";
var EM_ALERT_AUTO_ASSIGNMENT_FIELD_DEFAULT_VALUE = "cmdb_ci.support_group,IntegrationGroup";
var propertiesGr = new GlideRecord('sys_properties');
var propertiesOrGr = propertiesGr.addQuery("name", EM_ALERT_AUTO_ASSIGNMENT_FIELD);
propertiesOrGr.addOrCondition("name",  EM_ENABLE_GROUP_LEVEL_EVENT_RULES);
propertiesGr.query();
while (propertiesGr.next()) {
    var propertyValue = propertiesGr.getValue("value") != null ? propertiesGr.getValue("value") : "";
    var propertyName = propertiesGr.getValue("name");
    var evtMgmtCommons = new EvtMgmtCommons();
    if (propertyName == EM_ALERT_AUTO_ASSIGNMENT_FIELD) {
        if (propertyValue == "") {
            //check whether this is a new customer
            if (evtMgmtCommons.isNewInstance()) { //new customer, enable the property
                log += "'EM - Enable auto-assignment group': em_alert table has at least 10 records\n";
                propertiesGr.setValue("value", EM_ALERT_AUTO_ASSIGNMENT_FIELD_DEFAULT_VALUE);
                propertiesGr.update();
                log += "Enabling '" + EM_ALERT_AUTO_ASSIGNMENT_FIELD + "' property for new customers\n";
            }
        }
    } else if (propertyName == EM_ENABLE_GROUP_LEVEL_EVENT_RULES) {
        if (propertyValue === 'false') {
            //check whether this is a new customer
            if (evtMgmtCommons.isNewInstance()) { //new customer, enable the property
                log += "'EM - Enable auto-assignment group': em_alert table has at least 10 records\n";
                propertiesGr.setValue("value", true);
                propertiesGr.update();
                log += "Enabling '" + EM_ENABLE_GROUP_LEVEL_EVENT_RULES + "' property for new customers\n";
            }
        }
    }
}
log += "Finish to run 'EM - enable auto-assignment group' fix script.";
if (evtMgmtCommons.isDebugEnabled())
    gs.info(log);
