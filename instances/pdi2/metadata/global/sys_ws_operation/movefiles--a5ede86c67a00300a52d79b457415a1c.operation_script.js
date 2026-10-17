(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestParms = request.body.data;
	var targetAppId = requestParms.targetAppId;
	var metadataSysIds = requestParms.metadataSysIds;
	
	response.setContentType('application/json');
	if(GlideStringUtil.nil(targetAppId)) {
		addError(gs.getMessage("No application id was provided."));
		return;
	}
	
	if(metadataSysIds == null || metadataSysIds.length == 0) {
		addError(gs.getMessage("No files were listed to move."));
		return;
	}
	
	var moveResponse = sn_gfiles.GlobalApp.moveMetadata(metadataSysIds, targetAppId);
	if(!moveResponse.success()) {
		addError("Error moving files: " + moveResponse.getErrorMessage());
		return;
	}
	
	response.setBody({
		status: 'success'
	});	

	function addError(msg){
		response.setBody({
			status: 'error',
			errorMessage: msg
		});		
	}
})(request, response);
