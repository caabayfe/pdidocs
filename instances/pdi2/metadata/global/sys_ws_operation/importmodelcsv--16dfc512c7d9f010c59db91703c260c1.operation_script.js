(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data;
    try {
        var result = ImportNLUModel.importModel(data);
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
