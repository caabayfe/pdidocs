(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var id = request.pathParams.id;
        if (!id) {
            response.setStatus(400);
            response.setBody({error: "Missing 'id' path parameter"});
            return;
        }

        var configs = new sn_nowassist_admin.SkillBuilderNaaUtils().getSkillConfigs();
        var skillConfig = configs.find(function(cfg) { return cfg.id === id; });

        if (!skillConfig) {
            response.setStatus(404);
            response.setBody({error: "No config found with given id"});
            return;
        }

        response.setStatus(200);
        response.setBody({skill_id: skillConfig.skill_id});
    } catch (e) {
        response.setStatus(500);
        response.setBody({error: e.message});
    }
})(request, response);
