GoToSensor();

function GoToSensor() {
    var url = current;
    var epp = new ECCPayloadParser(current.payload);
	var parameters = epp.getParameters();
	var probeSysId = parameters['probe'];
    
    if (JSUtil.nil(probeSysId))
        return action.setRedirectURL(url);

	var sensorCache = new SNC.SensorCache();
	var gr = sensorCache.getByProbe(probeSysId);	
	
	if (!gr)
		return action.setRedirectURL(url);
	
	
	return action.setRedirectURL('discovery_sensor.do?sys_id=' + gr.sys_id);

    action.setRedirectURL(url);
}
