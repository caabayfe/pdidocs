(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    if (!request.body || !request.body.data) {
        response.setStatus(400);
        response.setBody({ error: "Missing request body" });
        return;
    }

    var sysId = request.body.data.sysparm_sysid;
    var fileName = request.body.data.sysparm_filename;

    if (!sysId || !fileName) {
        response.setStatus(400);
        response.setBody({ error: "Missing required parameters: sysparm_sysid and sysparm_filename" });
        return;
    }

    var script = new global.GoogleSheetListExport();
    var result = script.getGoogleSheetId(sysId, fileName);

    response.setStatus(200);
    response.setBody({ message: "Script Include executed successfully", result: result });

})(request, response);
