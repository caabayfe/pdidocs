cleanUpSMBConnections();

function cleanUpSMBConnections() {
    var sourceIP;
    var midServerName;
    var midRecord;
    var discoveryDeviceHistorySysId = event.parm1;
    var discoveryStatusSysId = event.parm2;
	
    var deviceHistoryGr = new GlideRecord('discovery_device_history');
    deviceHistoryGr.addQuery('sys_id', discoveryDeviceHistorySysId);
    deviceHistoryGr.query();
    if (!deviceHistoryGr.next()) {
        gs.debug("Query to discovery_device_history returned no results.");
        return;
    }

    if (!deviceHistoryGr.cmdb_ci.os.startsWith('Windows')) {
        gs.debug("SMB Cleanup not required for non Windows devices.");
        return;
    }

    sourceIP = deviceHistoryGr.getValue('source');
    if (!sourceIP) {
        gs.logError("Could not fetch target IP from discovery_device_history.sys_id=" + discoveryDeviceHistorySysId);
		return;
	}

    midServerName = getMidServerName(sourceIP, discoveryStatusSysId);
    if (!midServerName) {
        return;
    }
	
	midRecord = getMIDRecord(midServerName);
    if (!(midRecord && midRecord.ipAddress && midRecord.sysID)) {
        gs.logError("Could not fetch mid_server info");
		return;
	}
	
	if (!shouldTriggerProbe(midRecord.sysID)) {
		gs.debug("SMB Cleanup probe not enabled for " + midServerName + ". Launch abandoned.");
		return;
	}
    try {
        triggerProbe(sourceIP, midServerName, midRecord.ipAddress, discoveryStatusSysId);
    } catch (e) {
        gs.logError("Caught exeption while triggering SMB probe -  " + e.toString());
    }
}

function getMidServerName(sourceIP, discoveryStatusSysId) {
    var midServerName;

    var gr = new GlideRecord('ecc_queue');
    gr.addQuery('source', sourceIP);
    gr.addQuery('agent_correlator', discoveryStatusSysId); //disco status
	gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        midServerName = gr.getValue('agent');
    } else {
        gs.logError("Could not fetch midServerName from ecc_queue for source IP = " + sourceIP + ", discovery_status.sys_id = " + discoveryStatusSysId);
        return midServerName;
    }
		
    // DEF0319866: Removing 'mid.server.' prefix explicitly from MID name. An ecc_queue record for an
    //  agent which does not begin with that prefix does not represent a MID (e.g. Help Desk agent),
    //  so return nothing in that case.
    var midServerPrefix = 'mid.server.';
    return midServerName.startsWith(midServerPrefix) ? midServerName.replace(midServerPrefix,'') : null;
}

function getMIDRecord(midServerName) {
	var mid = {};
	var gr = new GlideRecord('ecc_agent');
	gr.query('name', midServerName);
	if (gr.next()) {
		mid.ipAddress = gr.getValue('ip_address');
		mid.sysID = gr.getUniqueValue();
	}
	return mid;
}

function shouldTriggerProbe(midSysID) {
	var gr = new GlideRecord('ecc_agent_property');
	gr.addNullQuery('ecc_agent').addOrCondition('ecc_agent', midSysID);
	gr.addQuery('name', 'mid.smb.enable_force_close');
	gr.query();
	var val = gr.next() ? gr.getValue('value') : false;
	return val == 'true';
}

function triggerProbe(sourceIP, midServerName, midIPAddress, correlator) {
    var probe = SncProbe.get('Windows - Cleanup SMB Sessions');
    probe.setSource(sourceIP);
    probe.addParameter('midIPAddress', midIPAddress);
    probe.setCorrelator(correlator);

    gs.log("Triggering 'Windows - Cleanup SMB Sessions' Probe for midServerName = " + midServerName);
    probe.create(midServerName);
}
