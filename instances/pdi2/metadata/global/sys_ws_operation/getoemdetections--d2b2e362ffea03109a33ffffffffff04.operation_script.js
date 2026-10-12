(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    if (!request.body || !request.body.data) {
        response.setStatus(400);
        response.setBody({
            isError: true,
            errorMessage: 'Request body or body.data is missing'
        });
        return response;
    }
    var texts = request.body.data.texts;
    var parms = request.body.data.parms;
    try {
        // Resolve translator sys_id to translator name
        if (parms && parms.translator) {
            var translatorSysId = parms.translator;
            var gr = new GlideRecord('sn_dt_translator_configuration');
            if (gr.get(translatorSysId)) {
                parms.translator = gr.getValue('name');
            } else {
                response.setStatus(400);
                response.setBody({
                    isError: true,
                    errorMessage: 'Translator configuration not found for sys_id: ' + translatorSysId
                });
                return response;
            }
        }
        var detectedResponse = sn_dt_api.DynamicTranslation.getDetectedLanguages(texts, parms);
        detectedResponse['isError'] = false;
        response.setStatus(200);
        response.setBody(detectedResponse);
        return response;
    } catch (ex) {
        response.setStatus(500);
        response.setBody({
            isError: true,
            errorMessage: ex.message
        });
        return response;
    }
})(request, response);
