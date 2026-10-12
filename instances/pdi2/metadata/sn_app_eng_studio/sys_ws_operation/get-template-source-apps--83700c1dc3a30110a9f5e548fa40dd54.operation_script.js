(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var data = [];
        var createFromScratchSourceAppRecords = new GlideRecord('sys_app_info');

        createFromScratchSourceAppRecords.query();

        while (createFromScratchSourceAppRecords.next()) {
            var properties = createFromScratchSourceAppRecords.getValue('properties');
            var propertiesObj = JSON.parse(properties);
            var isSourceApp = propertiesObj && propertiesObj.hasOwnProperty("origin") && propertiesObj["origin"] === "create_from_scratch";

            if (isSourceApp) {
                data.push(createFromScratchSourceAppRecords.getValue('sys_scope'));
            }
        }

        response.setBody(data);
        response.setStatus(200);
    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
    }
})(request, response);
