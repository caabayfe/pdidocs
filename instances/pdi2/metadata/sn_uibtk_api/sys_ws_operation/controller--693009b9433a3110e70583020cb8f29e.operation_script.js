(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const {
            name,
            description,
            sysId,
            controllerConfigGuidance
        } = request.body.data;
        if (!sysId) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_CONTROLLER_FOUND);
        }
        apiHelper.getResponseGlideOperation(new Controller().updateRecord({
            controllerConfigGuidance,
            name,
            description,
            sysId
        }), BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE);
    });

})(request, response);
