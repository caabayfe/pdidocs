var deviceHistory = ((typeof g_device != 'undefined') && g_device) ? g_device : SncDeviceHistory.getFromSourceAndStatusAndClassification(current.source, current.status, current.classification_probe);
/**
 * DEF0579832: ApplicationDependencyMapping.map() called for each Discovery Device History
 * 1. Other inputs for the CI remain in ready state due to IP optimization (Try to keep only one discovery active for a CI)
 * 2. When the discovery for the first IP completes we either give the green light to the other IPs, or mark them complete
 * 3. If discovery completed successfully, we mark it complete 
 * 4. Now we update all the ecc_queue inputs which were 'hanging' in ready state, which leads to updating the device histories and thus the same worker thread
 * 5. However, somewhere else in the sensor processing we already set g_device in the global space
 * 6. Therefore, deviceHistory ends up being the same for all IPs processed
 * 7. As such, the condition for shouldFireAdm is incorrectly set to true
 * 8. Adding deviceHistory.getSource() == current.source ensures duplicate IPs will not match the condition since deviceHistory.getSource() is the same for all IPs of the same CI 
 */
var shouldFireAdm = (deviceHistory.getScratchpadValue('requires_adm') == 'true') && (deviceHistory.getSource() == current.source);

if (shouldFireAdm)
	fireAdm();

runCompletionTasks();

function fireAdm() {
	var source = ''+current.source;
    var status = '' + current.status;
    var classificationProbe = '' + current.classification_probe;
    var script = 'ApplicationDependencyMapping.map("' + source + '", "' + status + '", "' + classificationProbe + '");';
	new GlideRunScriptJob().scheduleScript(script, "ApplicationDependencyMappingScriptJob", new GlideDateTime());
	gs.eventQueue("discovery.device.adm.mapping_started", "discovery_device_history", current.sys_id, current.cmdb_ci, script);
}

function runCompletionTasks() {
    var status = new DiscoveryStatus('' + current.status);
    // DEF0171825: do not create discovery complete events for additional ips of a CI
    if (current.last_state != "Identified, ignored extra IP")
        throwDeviceCompleteEvent();

    updateDHState(status);
}

function updateDHState(status) {
    if (!status.discoverCIs() && !status.discoverNets())
        return;

    if (JSUtil.nil(deviceHistory.getCurrentState()))
        return;

    var created = (('' + deviceHistory.getLastState()) == 'Created CI');
    deviceHistory.setStopWorkflow(true);
    deviceHistory.state(created ? 'Created CI' : 'Updated CI', '', status.logStateChanges, 'Device complete');
    deviceHistory.setStopWorkflow(false);

	if ((current.classified_as + '') == 'cmdb_ci_ip_switch')
		updateOriginalCIState();
}

function throwDeviceCompleteEvent() {
    gs.eventQueue("discovery.device.complete", current, current.sys_id, current.status);
}

function updateOriginalCIState() {
	var source = current.source + '';

	var isMasterSwitch = source.includes("_Master");
	if (!isMasterSwitch)
		return;

	var ip = source.split("_")[0];

	var gr = new GlideRecord("discovery_device_history");
	gr.addQuery("status", current.status);
	gr.addQuery("source", ip);
	gr.addQuery("classification_probe", current.classification_probe);
	gr.addNullQuery("cmdb_ci");
	gr.setLimit(1);
	gr.query();

	if (!gr.next())
		return;

	gr.setValue("cmdb_ci", current.cmdb_ci);
	gr.setValue("classified_as", current.classified_as);
	gr.setValue("last_state", current.last_state);
	gr.setWorkflow(false);
	gr.update();
}
