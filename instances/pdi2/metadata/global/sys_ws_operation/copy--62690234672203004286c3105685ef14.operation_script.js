(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var payload = request.body.data.sysID;
    var gr = new GlideRecord('asmt_metric_type');
    gr.get(payload);
    var results = {};
    response.setContentType("application/json");
    if (!gs.hasRole('survey_admin') && !gs.hasRole('assessment_admin') && gs.hasRole('survey_creator') && (gr.survey_owners + "").indexOf(gs.getUserID()) == -1) {
        results.sysID = "-1";
        results.name = "User is not the owner of the survey";
        response.setBody(results);
        return response;
    }
    var newMetricTypeSysID = new CloneSurvey().cloneMetricType(gr);

    var metric_type = new GlideRecord('asmt_mnetric_type');
    gr.get(newMetricTypeSysID);


    results.sysID = newMetricTypeSysID;
    results.name = gr.getValue('name');

    response.setBody(results);
    return response;

})(request, response);
