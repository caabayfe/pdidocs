(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const apiHelper = new APIHelper(request, response);
	apiHelper.execute(function(){
		const presetId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
    const commaSeparatedFields = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.FIELDS, null);
    const fields = commaSeparatedFields !== null ? commaSeparatedFields.split(',') : null;
		const controllerPreset = new ControllerPreset(fields).getRecordById(presetId);
		const componentPreset = new ComponentPreset(fields).getRecordById(presetId);
		if(componentPreset !== null || controllerPreset !== null){
			const preset = componentPreset !== null ? componentPreset : controllerPreset;
			apiHelper.respondSuccesfully(preset);
		}
    else{
		  apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_PRESET_FOUND);
    }
	});

})(request, response);
