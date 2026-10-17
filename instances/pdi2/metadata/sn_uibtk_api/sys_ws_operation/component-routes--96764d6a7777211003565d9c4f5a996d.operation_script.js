(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
        const macroponentHandler = new Macroponent('sys_id,name,composition,sys_scope,sys_updated_by,sys_updated_on,sys_domain,'.split(','), noDomain, true);

        apiHelper.getResponse(macroponentHandler.getMacroponentRoutes(sysId), BuilderToolkitConstants.ERRORS.NO_COMPONENT_DEFINITIONS);
    });

})(request, response);
