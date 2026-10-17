(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var logger = new sn_wwna.WWNALogger();

    var queryParams = request.queryParams;
    var skill_id = getParam(queryParams, 'skill_id');
    var record_table_name = getParam(queryParams, 'record_table_name');
    var record_sys_id = getParam(queryParams, 'record_sys_id');
    var skill_table_name = getParam(queryParams, 'skill_table_name');
    var skill_config_id = getParam(queryParams, 'skill_config_id');

    logger.info("WWNA: Skill Config API Query Parameters: " + JSON.stringify({
        skill_id,
        record_table_name,
        record_sys_id,
        skill_table_name,
        skill_config_id
    }));

    if (!skill_id && !skill_config_id) {
        logger.error("WWNA: Skill Config API Missing Query Parameters: either skill_id or skill_config_id should be provided");
        response.setStatus(200);

        return response.setBody({
            status: 'success',
            data: {
                message: 'Missing required parameter: either skill_id or skill_config_id should be provided',
                isError: true
            }
        });
    }

    try {
        var skillConfigObj = new sn_wwna.WWNAUtils().fetchNACMSkillConfiguration(skill_id, record_table_name, record_sys_id, skill_table_name, skill_config_id);

        if (skillConfigObj) {
            logger.info("WWNA: Skill Config API formatted skillConfiguration: " + JSON.stringify(skillConfigObj));
            response.setStatus(200);
            return response.setBody({
                status: 'success',
                data: skillConfigObj
            });
        } else {
            throw new Error("WWNA: Skill Config API error: Skill configuration not found.");
        }

    } catch (error) {
        logger.error("WWNA: Skill Config API error: " + error.message);
        response.setStatus(200);
        return response.setBody({
            status: 'success',
            data: {
                message: "Something went wrong, please contact your system Admin!",
                isError: true
            }
        });
    }

    function getParam(rParams, key) {
        return rParams[key] ? rParams[key][0] : "";
    }
})(request, response);
