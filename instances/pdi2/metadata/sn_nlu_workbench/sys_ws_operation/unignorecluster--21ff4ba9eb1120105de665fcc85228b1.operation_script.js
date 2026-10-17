(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var  clusterId = request.pathParams.cluster_id;

    try {
        if (clusterId) {

            var result = new sn_nlu_workbench.NLUImprovementAnalaysisReport().unIgnoreCluster(clusterId);

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
