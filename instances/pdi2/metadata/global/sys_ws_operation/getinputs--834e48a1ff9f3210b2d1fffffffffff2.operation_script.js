(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Get skillConfigId from the URL path (e.g. /skill/ABC123.../inputs)
    var skillConfigId = request.pathParams.skillConfigId;

    // Fallback to query parameter if someone uses ?skillConfigId=ABC123
    if (!skillConfigId) {
        skillConfigId = request.queryParams.skillConfigId;
    }

    if (!skillConfigId) {
        response.setStatus(400);
        response.setBody({
            error: "Missing skillConfigId. Use /skill/{skillConfigId}/inputs or ?skillConfigId=..."
        });
        return;
    }

    var capabilityId = skillConfigId;

    // Call the exact same function you used before
    var dynamicSkillInputs = new sn_skill_builder.NASKFlowDesignerUtils()
                               .getDynamicInputsForSkill(skillConfigId, capabilityId) || [];

    // === SEND CLEAN RESPONSE ===
    response.setStatus(200);
    response.setBody({
        "data": dynamicSkillInputs,
        "skillConfigId": skillConfigId   // helpful for debugging
    });

})(request, response);
