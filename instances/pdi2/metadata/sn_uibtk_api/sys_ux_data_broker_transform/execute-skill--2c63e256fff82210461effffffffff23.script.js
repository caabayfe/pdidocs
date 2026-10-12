function transform(input) {
    if (input.skillConfigId) {
        var assistAdminHelper = new sn_nowassist_admin.NowAssistSkillConfig();
        var isActive = assistAdminHelper.isSkillConfigurationActive(input.skillConfigId);

        if (isActive) {
            var requestWithSkillConfig = {
                "timeout": 120,
                "mode": "async",
                "ambCallbackChannel": input.ambChannel,
                "meta": {
                    "skillConfigId": input.skillConfigId
                },
                "executionRequests": [{
                    "payload": input.payload || {},
                    "capabilityId": input.oneExtendCapabilityId,
                    "returnRequest": false
                }]
            };

            const result = sn_one_extend.OneExtendUtil.executeSecure(requestWithSkillConfig);

            if (result.status === 'error') {
                gs.publishToUser(input.ambChannel, {
                    error: result.message
                }, input.userName);
            }
        } else {
            const inactivePayload = {
                error: gs.getMessage("Skill is not active. Please activate to execute")
            };

            gs.publishToUser(input.ambChannel, inactivePayload, input.userName);
        }
    } else if (input.oneExtendCapabilityId) {
        var requestWithoutSkillConfig = {
            "timeout": 120,
            "mode": "async",
            "ambCallbackChannel": input.ambChannel,
            "executionRequests": [{
                "payload": input.payload || {},
                "capabilityId": input.oneExtendCapabilityId,
                "returnRequest": false
            }]
        };

        const result = sn_one_extend.OneExtendUtil.executeSecure(requestWithoutSkillConfig);

        if (result.status === 'error') {
            gs.publishToUser(input.ambChannel, {
                error: result.message
            }, input.userName);
        }
    }
}
