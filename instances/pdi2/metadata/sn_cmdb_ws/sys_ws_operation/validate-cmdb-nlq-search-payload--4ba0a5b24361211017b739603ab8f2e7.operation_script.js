(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var body = request.body;
    if (!body || Object.keys(body.data).length === 0) {
        response.setStatus(400);
        response.setError(new sn_ws_err.BadRequestError("Required validation payload was missing from the request."));
        return response;
    }

    var data = body.data;
    var message = "";

    // Currently the validator only supports non-cmdb table validation but should be expanded 
    var isValidPayload = validateTables(data.tables);

    // If there are two or more non-cmdb tables in an utterance and no cmdb table that is a validation error.
    function validateTables(tables) {
        // valid if no tables present, this is a name search query
        if (!tables || tables.length === 0) {
            return true;
        }

        var nonCmdbTables = [];
        var cmdbTables = [];
        tables.forEach(function(table) {
            var tableTester = new GlideTableHierarchy(table);
            var hierarchyTables = tableTester.getHierarchy();
            if (hierarchyTables.indexOf('cmdb') === -1)
                nonCmdbTables.push(table);
            else
                cmdbTables.push(table);
        });
        if (nonCmdbTables.length > 1 && cmdbTables.length === 0) {
            message = gs.getMessage("Queries with multiple non cmdb tables are not supported.");
            return false;
        }
        return true;
    }

    response.setBody({
        isValidPayload: isValidPayload,
        message: message
    });


})(request, response);
