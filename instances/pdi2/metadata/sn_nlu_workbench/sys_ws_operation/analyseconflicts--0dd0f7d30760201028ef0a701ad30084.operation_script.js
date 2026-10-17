(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;

    try {
        if ((data.modelList && Array.isArray(data.modelList)) || data.definition) {
            var result = sn_nlu_workbench.NLUConflictDefinition.analyseConflicts(data.modelList, data.definition);
            response.setStatus(200);
            response.setContentType('application/json');
            result.status = 'success';
            return result;
        } else {
            return new sn_ws_err.BadRequestError('Invalid input data provided');
        }
    } catch (e) {
        response.setStatus(400);
        return {
            status: 'failure',
            message: e.message
        };
    }

})(request, response);
