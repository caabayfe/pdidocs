var monitor_state_ids = [];
var connectorGr = new GlideRecord("em_connector_instance");
connectorGr.query();
while (connectorGr.next()) {
    monitor_state_ids.push(connectorGr.getValue("sys_id"));//get the sys_id's of all connectors
}

var monitorStateGr = new GlideRecord("em_monitor_state");
monitorStateGr.addQuery("table", "em_connector_instance");//query only records of connector instances
monitorStateGr.addQuery("monitored_sysid", "NOT IN", monitor_state_ids);
monitorStateGr.deleteMultiple();
