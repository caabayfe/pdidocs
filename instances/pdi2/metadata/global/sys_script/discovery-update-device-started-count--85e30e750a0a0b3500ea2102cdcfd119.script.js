var DeviceHistory = SncDeviceHistory;

increaseStartCount();
var parameters = getParameters(current);

function increaseStartCount() {
	if (current.isActionAborted())
		return;
	
    // don't do this if we have an RBA input record...
    if (('' + current.agent_correlator).indexOf('rba.') == 0)
        return;

    var dh = getDeviceHistory();
    if (!dh)
        return;

    dh.started();
}

function getDeviceHistory() {
	
	if (current.topic == 'CimProbe' || current.topic == 'MultiProbe') {
		var deviceHistory = getCimProbeDeviceHistory(current);
		if (deviceHistory)
			return deviceHistory;
	}
	
    var classificationProbe = getParameter('classification_probe');
    var source = current.getValue('source');
    var statusId = current.getValue('agent_correlator');
	var dh = new DeviceHistoryJS();
	dh.setSource(source);
	dh.setStatus(statusId);
	dh.setClassificationProbe(classificationProbe);
	return dh;
}

function getParameters(eccq) {
	return EccPayload(eccq).getProbeParameters()[0];
}

function getParameter(parameter) {
	var parameters = parameters || getParameters(current);
	for (var prop in parameters) {
		if (prop == parameter) {
            return ''+parameters[prop];
        }
    }
	return null;
}


function getCimProbeDeviceHistory(eccq) {
    
	var deviceInstance = getParameter('device_instance');
	var classificationProbe = getParameter('classification_probe');
	
   
    if (deviceInstance === null)
		return null;
   
    var source = new CimInstanceToken(deviceInstance).getHashToken(eccq.source);
    var statusId = eccq.getValue('agent_correlator');
	
	var dh = new DeviceHistoryJS();
	dh.setSource(source);
	dh.setStatus(statusId);
	dh.setClassificationProbe(classificationProbe);
	return dh;
}
