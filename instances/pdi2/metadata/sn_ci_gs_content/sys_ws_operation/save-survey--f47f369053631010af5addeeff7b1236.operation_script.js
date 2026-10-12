(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var selectedOptions = request.body.data.selectedOptions;
	var setupType = request.body.data.setupType;

    var guidedSetupSubmitSurvey = new sn_ci_gs_content.GuidedSetupSubmitSurvey();
    return guidedSetupSubmitSurvey.saveSurvey(request.pathParams.guidedSetupId, selectedOptions, setupType);

})(request, response);
