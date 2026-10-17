/* Find the last time the layer 2 connections algorithm was triggered by searching the layer2_triggered parameter
 in the scratchpad field of the discovery_device_history records of this CI. 
 If the period of time passed since the last time the algorithm was triggered is more than the period of time
  defined in sa.create_physical_connections.minutes_frequency property, 
  run the algorithm and add the layer2_triggered parameter to the scratchpad of the current
  discovery_device_history record with value true */
var layer2FrequencyMinutes = gs.getProperty('sa.create_physical_connections.minutes_frequency', 1440);
var lastDhTimeToCheck = new GlideDateTime();
lastDhTimeToCheck.addSeconds(-1 * 60 * layer2FrequencyMinutes);
var gr = new GlideRecord('discovery_device_history');
gr.addQuery('cmdb_ci', current.cmdb_ci);
gr.addQuery('sys_updated_on', '>=', lastDhTimeToCheck);
gr.addQuery('scratchpad', 'CONTAINS', 'layer2_triggered');
gr.setLimit(1);
gr.query();
if (!gr.hasNext()) {
    // No L2 connection run on this CI in the last configured time (24h by default)
    gs.eventQueue('physical_connections.create', null, current.cmdb_ci);
    dh = new SncDeviceHistory(current);
    dh.setScratchpadValue("layer2_triggered", "true");
}
