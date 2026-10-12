(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const apiHelper = new APIHelper(request, response);

	function createComponentPreset() {
		const {name, description, controller, controller_dependencies = null, component} = request.body.data;
		if(!name || (name.trim && name.trim() === '')) {
			return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_PRESET_NAME);
		}
		if(!component || (component.trim && component.trim() === '')) {
			return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_PRESET_COMPONENT);
		}
		const result = new ComponentPreset().createRecord({name, description, controller, controller_dependencies, component});
		if(result === false) {
			apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.FAILED_TO_CREATE_COMPONENT_PRESET);
		} else {
			apiHelper.respondSuccesfully({componentPresetID: result});
		}
	}
	
	apiHelper.execute(createComponentPreset);
})(request, response);
