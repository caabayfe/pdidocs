(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var json = {};
	var msg = "";
	
	try {
		var body = GlideStringUtil.getStringFromStream(request.body.dataStream);
		
		if (GlideStringUtil.nil(body)) {
			msg = gs.getMessage("Wrong input for remove manual EP, input must not be empty");
		} else {
			
			try {
				json = JSON.parse(body);
			}
			catch (eJson) {
				msg = gs.getMessage("Wrong input for remove manual EP, input must be JSON. {0}", [eJson]);
			}
			
			if(msg ===""){
				var bsid = json.bsid;
				var targetSysId = json.targetSysId;
				var endpointSysIds = json.endpointSysIds;
				
				var bsManager = new SNC.BusinessServiceManager();
				var endpointSysIdsStr="";
				for(var i=0;i<endpointSysIds.length; i++){
					endpointSysIdsStr=endpointSysIdsStr + endpointSysIds[i]+ ",";
				}
				msg=bsManager.removeManualEPs(targetSysId,bsid,endpointSysIdsStr);
			}
		}
	}
	catch(e){
		msg = gs.getMessage("An error occurred on remove manual EP. {0}", [e]);
	}
	var exception;
	if(msg!==""){
		exception=new sn_ws_err.ServiceError().setStatus(400);
		exception.setMessage(msg);
		throw exception;
	}
	
	return "";
	
	
})(request, response);
