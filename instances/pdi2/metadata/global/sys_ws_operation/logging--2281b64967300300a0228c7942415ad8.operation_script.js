(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    if(request.pathParams.flag == "enable") {
        GlideSessionDebug.enable("cs_debug");
        GlideSessionDebug.enable("log");
    }
    else if(request.pathParams.flag == "disable") {
        GlideSessionDebug.disable("cs_debug");
        GlideSessionDebug.disable("log");
    }
    else {
        response.setStatus(400);
    }

})(request, response);
