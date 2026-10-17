(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const applicationSysId = request.queryParams.application_sys_id && request.queryParams.application_sys_id[0] ?
        request.queryParams.application_sys_id[0].toLowerCase() :
        '';
    const type = request.queryParams.type && request.queryParams.type[0] ?
        request.queryParams.type[0].toLowerCase() :
        '';
    return AESPluginValidator.getSNSInfo(type, applicationSysId);

})(request, response);
