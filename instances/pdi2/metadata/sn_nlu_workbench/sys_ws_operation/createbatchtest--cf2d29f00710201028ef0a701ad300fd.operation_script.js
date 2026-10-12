(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;

    try {
        if (typeof global.NLUSystemUtil.canPerformEditOperations === 'function' && !global.NLUSystemUtil.canPerformEditOperations(data.model)) {
            return {
                status: "Error: User does not have the ACL permission"
            };
        }
        var result = sn_nlu_workbench.NLUBatchTestProcessor.createBatchTestSet(data);
        if (result.status === 'success') {
            response.setStatus(200);
        } else {
            response.setStatus(400);
        }
        response.setContentType('application/json');
        return result;
    } catch (e) {
        response.setStatus(400);
        return {
            status: 'failure',
            message: e.message
        };
    }

})(request, response);
