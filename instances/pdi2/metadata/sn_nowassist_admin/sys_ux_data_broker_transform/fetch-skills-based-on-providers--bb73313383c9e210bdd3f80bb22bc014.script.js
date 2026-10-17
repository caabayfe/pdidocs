function transform(input) {
    try {
        if (input && input.type == 'fetch_skill') {
            return NAAManageLLMAPI.fetchSkillDataForManageProviders(input);
        } else if (input && input.type == 'fetch_fn_group_provider_data') {
            return NAAManageLLMAPI.fetchFunctionalGroupProviderData(input);
        } else if (input && input.type == "fetch_all_capability_and_skills") {
            return NAAManageLLMAPI.fetchAllCapabilityAndSkills();
        } else if (input && input.type == "check_consent_for_skills") {
            var consent = true;
            if (input?.payload?.skillList.length > 0) {
                for (const skill of input?.payload?.skillList) {
                    consent = NAAGenAIUtil.checkConsentForSkillConfig(skill?.id, '', input?.payload?.providerId);
                    if (consent == false) {
                        return {
                            'skillConsent': consent
                        };
                    }
                }
            }
            return {
                'skillConsent': consent
            };

        } else if (input && input.type == "set_consent_for_skills") {
            if (input?.payload?.skillList.length > 0) {
                for (const skill of input?.payload?.skillList) {
                    NAAGenAIUtil.setLLMConsentForSkill(skill?.id, input?.payload?.providerId);
                }
            }

        } else if (input && input.type == "FETCH_ALLOWED_PROVIDERS_FROM_AICT") {
            return {
                "type": "FETCH_ALLOWED_PROVIDERS_FROM_AICT",
                "output": NAAManageLLMAPI.getAllowedAndNotAllowedProviders()

            };
        } else if (input && input.type == "FETCH_MIMIR_DEFAULT_PROVIDER") {
            return {
                "type": "FETCH_MIMIR_DEFAULT_PROVIDER",
                "output": {
                    'mimirDefaultProvider': NAAManageLLMAPI.getMimirDefaultProvider(),
                    'hideMimirProviderBanner': NAAManageLLMAPI.hasInstanceLevelProviderUpdate()
                }

            };
        } else if (input && input.type == "FETCH_AGENT_LIST") {
            try {
                const agentAndWorkFlowList = new sn_aia.AIAgentEvaluation().deactivateSkillsForExcludedProvider(input?.payload?.providerId, false).data;
                const disabledAgentList = agentAndWorkFlowList.filter(item => item.isAgent);
                const disabledAgenticWorkflow = agentAndWorkFlowList.filter(item => !item.isAgent);

                return {
                    'type': 'FETCH_AGENT_LIST',
                    'agentList': agentAndWorkFlowList,
                    'disabledAgentList': disabledAgentList,
                    'disabledAgenticWorkflow': disabledAgenticWorkflow,
                };

            } catch (e) {
                gs.error("Error while calling agent listing api " + e.toString());
            }

        } else {
            return NAAManageLLMAPI.fetchDataForFunctionalGroupListing(input);
        }
    } catch (e) {
        gs.error("Failed skills based on provider - " + e.toString());
        throw new Error("Failed fetching skills or group based on provider");
    }
}
