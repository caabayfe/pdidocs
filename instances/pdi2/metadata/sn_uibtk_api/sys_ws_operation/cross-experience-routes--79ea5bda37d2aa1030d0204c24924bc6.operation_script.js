(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
        const experienceFields = 'title,root_macroponent,path,sys_updated_on,sys_updated_by,sys_policy,sys_scope,sys_package,sys_domain,admin_panel,parent_app'.split(',');
        const experienceHandler = new Experience(experienceFields, noDomain, true);
        apiHelper.respondSuccesfully(experienceHandler.getSharedRoutesForExperience());
    });

})(request, response);
