(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const skillSysIds = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_IDS, null);
        const skillClass = new SkillDefinitions();
        const skillDefinitions = skillClass.getSkills(skillSysIds);

        apiHelper.getResponse({
            skillDefinitions
        }, BuilderToolkitConstants.ERRORS.NO_SKILLS);
    });
})(request, response);
