(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const {
            preset,
            clientScripts
        } = request.body.data;
        if (!preset) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE_COMPONENT_PRESET);
        }
        apiHelper.getResponseFromMutliOperation({
            preset: new ComponentPreset().updateRecord(preset),
            clientScripts: clientScripts ? new ClientScript().processRecordsByDatabaseOperation(clientScripts) : true
        });
    });

})(request, response);
