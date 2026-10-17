(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data;
    try {
        var modelId = data.sysId;
        var opts = data.opts;
        if (modelId) {
            var cloneModel = new NLUCloneModel(modelId);
            response.setContentType('application/json');
            return cloneModel.clone(opts);

        } else {
            return new sn_ws_err.BadRequestError("Input is not valid");
        }

    } catch (e) {
        return {
            status: 'failure',
            message: e.message
        };
    }

})(request, response);
