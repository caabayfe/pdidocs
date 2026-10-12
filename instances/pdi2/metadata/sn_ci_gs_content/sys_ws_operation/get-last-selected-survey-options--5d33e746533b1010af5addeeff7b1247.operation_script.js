(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var guidedSetupSubmitSurveyHelper = new sn_ci_gs_content.GuidedSetupSubmitSurvey();
        return guidedSetupSubmitSurveyHelper.getSelectedSurveyOptions();
    } catch (e) {
        gs.error('Error occured while getting last selected survey options' + e);
    }


})(request, response);
