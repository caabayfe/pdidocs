(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var TABLE_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        const playerController = new global.SNHelpSetupPlaybookActivityController();
        const data = request.body.data;
        if (!data || !data.table || !TABLE_NAME_PATTERN.test(data.table) || !GlideTableDescriptor.isValid(data.table)) {
            response.setStatus(400);
            response.setBody({
                error: "Invalid table name"
            });
            return;
        }
        const result = playerController.createRecord(data);
        response.setStatus(result.status);
        if (result.data) {
            response.setBody(result.data);
        } else {
            response.setBody({
                error: result.message || result.error
            });
        }
    } catch (ex) {
        response.setStatus(500);
        response.setBody({
            error: "Internal Server Error " + ex
        });
    }
})(request, response);
