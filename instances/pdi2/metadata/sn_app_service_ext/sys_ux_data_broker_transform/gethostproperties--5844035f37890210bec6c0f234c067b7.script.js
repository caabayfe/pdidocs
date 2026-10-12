// returns array of host properties of selected CI
function transform(input) {
	var selectedNodeSysId = input.selectedNodeSysId;
	var serviceId = input.serviceId;
	var selectedNodeStableId = input.selectedNodeStableId;

	var result = {
		errors: [],
		host_properties: []
	};

	if (!selectedNodeSysId) {
		result.errors.push('CI ID is missing');
	}
	if (!serviceId) {
		result.errors.push('Service ID is missing');
	}
	if (!selectedNodeStableId) {
		result.errors.push("CI Data does not contain selected ID's stable ID");
	}
	
	if (!result.errors.length) {
		var timestamp = null;
		try{
			var hostdata = new sn_app_service_ext.ApplicationServiceMapAPI().getCiHostData(selectedNodeSysId, selectedNodeStableId, timestamp, serviceId);
			result.host_properties = hostdata;
		} catch(e) {
			result.errors.push(e.toString());
		}
	}

	return result;
}
