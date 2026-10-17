(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var payload = request.body.data;
    var result = {};

    switch (payload.operation) {
        case "GET_SKILL_CONFIG":
            result = NowAdminAssistUtil.getSkillConfigAPI(payload.skillConfigId);
            break;
        case "UPDATE_SKILL_CONFIG_VAR_SET":
            result = NowAdminAssistUtil.updateSkillConfigVarSetAPI(payload.skillConfigId, payload.skillConfigVarSetId, payload.skillConfigVarSetData);
            break;
        case "UPDATE_DELIVERY_MODE":
            result = NowAdminAssistUtil.updateDeliveryModeAPI(payload.skillConfigId, payload.genAiSkillApplicabilityId, payload.inProductActive, payload.inProductRoles, payload.inMobileActive, payload.inMobileRoles, payload.ceActive, payload.ceRoles, payload.updateRoles, payload.chatExperiences, payload.stepCompleted, payload.isGeneratedFromSkillKit, payload.editedInNask);
            break;
        case "UPDATE_SKILL_CONFIG_VAR_SET_STEP_COMPLETED":
            result = NowAdminAssistUtil.updateSkillConfigVarSetStepCompletedAPI(payload.skillConfigId, payload.skillConfigVarSetId, payload.stepCompleted);
            break;
        case "ACTIVATE_SKILL_CONFIG":
            result = NowAdminAssistUtil.activateSkillConfigAPI(payload.skillConfigId, payload.hasVarSet);
            break;
        case "DEACTIVATE_SKILL_CONFIG":
            result = NowAdminAssistUtil.deActivateSkillConfigAPI(payload.skillConfigId);
            break;
        case "DUPLICATE_SKILL":
            result = NowAdminAssistUtil.duplicateSkillAPI(payload.skillConfigId, payload.isDomainDifferent, payload.domainId);
            break;
        case "GET_ROLES_LIST":
            result = NowAdminAssistUtil.getRolesListAPI();
            break;
        case "SAVE_RM_ROLES":
            result = NAARoleMaskingUtil.editRoleMaskingRolesForSkillAPI(payload.skillConfigId, payload.skillName, payload.roleMaskingData);
            break;
        default:
            result = {
                body: {},
                status: 404
            };
            break;
    }

    response.setContentType("application/json");
    response.setStatus(result.status);
    response.setBody(result.body);
})(request, response);
