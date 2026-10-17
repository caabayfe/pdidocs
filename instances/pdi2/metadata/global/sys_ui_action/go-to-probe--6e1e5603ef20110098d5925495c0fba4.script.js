GoToProbe();

function GoToProbe() {
    var url = current;
    var epp = new ECCPayloadParser(current.payload);
	var parameters = epp.getParameters();
	var probeSysId = parameters['probe'];
    
    if (JSUtil.nil(probeSysId))
        return action.setRedirectURL(url);
	
	return action.setRedirectURL('discovery_probes.do?sys_id=' + probeSysId);

    action.setRedirectURL(url);
}
