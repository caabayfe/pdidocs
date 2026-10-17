(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var result = ScanSuiteService.getScanSuites();

        response.setBody(result);
        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', "en", [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));

    }

})(request, response);
