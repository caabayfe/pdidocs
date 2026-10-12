(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;

    try {
        if (data) {
            var modelId = data.modelId || '';
            var intentName = data.intentName || '';
            var language = data.language || '';
            var dataMap = data.dataMap || {};
            var result = new sn_nlu_workbench.NLUImprovementAnalaysisReport().addUtterancesToIntent(modelId, intentName, language, dataMap);

            if (result.status === 'success') {
                response.setStatus(200);
            } else {
                response.setStatus(400);
            }

            response.setContentType('application/json');
            return result;
        } else {
            return new sn_ws_err.BadRequestError("No input data provided");
        }

    } catch (e) {
        return new sn_ws_err.BadRequestError(e.message);
    }

})(request, response);
