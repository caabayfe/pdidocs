var ProminNowAssistUtilSNC = Class.create();
ProminNowAssistUtilSNC.prototype = {
    initialize: function() {
        this.SKILLS = {
            PROCESS_CONFIG_RECOMMENDATIONS: {
                capabilityId: 'edb1169d0ff00710cdb223e530d1b213',
                skillConfigId: '5ab1169d0ff00710cdb223e530d1b2be',
            },
            STATE_RESPONSIBILITY_MAPPING: {
                capabilityId: 'fcbd97d10fbc0710cdb223e530d1b2ad',
                skillConfigId: '34bd97d10fbc0710cdb223e530d1b2e6',
            },
        };
    },

    isSkillConfigActive: function(skillConfigId) {
        try {
            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            return nowAssistSkillConfig.isSkillConfigurationActive(skillConfigId);
        } catch (e) {
            return false;
        }
    },

    /**
     * Invokes a NowAssist capability via OneExtend and returns the parsed model output.
     * @param {Object} payload - The capability-specific payload.
     * @param {{capabilityId: string, skillConfigId: string}} skill - The skill config object.
     * @returns {Object} Parsed model output from the LLM response.
     */
    executeCapabilityRequest: function(payload, skill) {
        if (!this.isSkillConfigActive(skill.skillConfigId)) {
            throw new Error('Skill configuration is not active');
        }

        var request = {
            executionRequests: [{
                payload: payload,
                capabilityId: skill.capabilityId,
            }],
        };
        var capabilityResponse = sn_one_extend.OneExtendUtil.executeSecure(request).capabilities[skill.capabilityId];

        if (!capabilityResponse || capabilityResponse.status !== 'success') {
            throw new Error('Capability request failed');
        }

        // NowLLM wraps the actual output in a JSON envelope: { model_output: "<stringified JSON>" }
        // 3rd-party providers (e.g. Azure) return the result directly without the wrapper.
        // Each level may arrive as a string or an already-parsed object depending on the provider.
        var rawResponse = capabilityResponse.response;
        var parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
        var modelOutput = parsed.model_output || parsed;
        return typeof modelOutput === 'string' ? JSON.parse(modelOutput) : modelOutput;
    },

    type: 'ProminNowAssistUtilSNC'
};
