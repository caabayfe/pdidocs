(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var result = new ep_Reminder().createReminder(request.body.data);
        if (!result) {
            response.setStatus(500);
            var error = new sn_ws_err.ServiceError();
            error.setMessage(gs.getMessage("Unable to create reminder"));
            response.setError(error);
        } else {
            response.setStatus(200);
            response.setBody(result);
        }
    } catch (error) {
        response.setStatus(400);
        response.setError(new sn_ws_err.BadRequestError(error.message));
    }
})(request, response);
