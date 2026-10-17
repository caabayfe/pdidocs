(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var lookupId = request.pathParams.lookupId;
    try {
        if (!gs.hasRole('nlu_admin')) throw new Error(gs.getMessage("User doesn't have access to perform this operation"));
        if (lookupId) {
            var result = new NLULookupTrainer(lookupId).trainLookup();

            if (result.status === 'success') {
                response.setStatus(200);
            } else {
                response.setStatus(400);
            }
            response.setContentType('application/json');
            return result;
        } else {
            return new sn_ws_err.BadRequestError('No input data provided');
        }
    } catch (e) {
        return e;
    }

})(request, response);
