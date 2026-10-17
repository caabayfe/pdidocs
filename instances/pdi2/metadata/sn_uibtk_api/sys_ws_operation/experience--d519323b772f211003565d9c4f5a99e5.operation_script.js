(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const retrieveDisplayValue = true;
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
        const experienceFields = 'title,root_macroponent,path,sys_updated_on,sys_updated_by,sys_policy,sys_scope,sys_package,sys_domain,admin_panel,parent_app'.split(',');
        const experienceHandler = new Experience(experienceFields, noDomain, retrieveDisplayValue);
        const experience = experienceHandler.getExperienceById(sysId);
        apiHelper.getResponse(experience, BuilderToolkitConstants.ERRORS.NO_EXPERIENCE_FOUND);
    });
})(request, response);
