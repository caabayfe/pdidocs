function transform(input) {
    try {
		const isInstanceSwitch = input?.providerConfiguration.some(record => record.selectionType === "instanceLevel");
        if (Array.isArray(input?.providerConfiguration)) {
            var result = [];
            input.providerConfiguration.forEach((record) => {
                const capabilityProviderList = [];
                const isOOBSkillOrInstance = record.selectionType === 'oobSkill' || record.selectionType === 'instanceLevel';
                const hasCapabilities = record?.capabilityList?.length > 0;
                let providerConfigurationId = record?.sys_id;
                let response;

                if (!isOOBSkillOrInstance) {
                    const naUtil = new sn_nowassist_admin.NowAssistSkillConfig();
                    const sessionDomain = naUtil._getCurrentDomainID() || "global";

                    if (
                        NAADomainUtil.isRecordDomainSeparationEnabled() &&
                        sessionDomain !== "global" &&
                        sessionDomain !== record.domain
                    ) {
                        providerConfigurationId = NAAGenAIUtil.upsertProviderConfigurationForDifferentDomain(
                            providerConfigurationId,
                            sessionDomain
                        );
                        NAAGenAIUtil.upsertLLMMappingsForDifferentDomain(record?.providers, providerConfigurationId);
                    }
                }

                if (hasCapabilities) {
                    const type = isInstanceSwitch ? "instance" : (record.selectionType === "oobSkill" ? "skill" : "skillgroup");
                    
                    record.capabilityList.forEach(capabilityId => {
                        const capabilityProviderObj = {
                            capabilityId,
                            providerId: record.selectedProvider,
                            scope_type : type
                        };
                        
                        if (type === "skillgroup") {
                            capabilityProviderObj.scope_id = record?.sys_id;
                        }
                        
                        capabilityProviderList.push(capabilityProviderObj);
                    });
                }

                response = new sn_generative_ai.GenerativeAIAdminUtil().changeDefaultDefinitionConfigUsingProvider(capabilityProviderList);
                try {
                    if (record?.source == "ai-agents") {
                        response.aiAgentResponse = new sn_aia.AIAgentEvaluation().deactivateSkillsForExcludedProvider(record.selectedProvider, true);

                    }
                } catch (e) {
                    gs.error("Error While Calling Agent disable Api " + e.toString());
                }

                if (!isOOBSkillOrInstance && response?.status !== "Error") {
                    const naUtil = new sn_nowassist_admin.NowAssistSkillConfig();
                    const sessionDomain = naUtil._getCurrentDomainID() || "global";
                    naUtil.upsertProviderConfigurationStatus(
                        providerConfigurationId,
                        record?.selectedProvider,
                        record?.azureConsentPassed,
                        sessionDomain !== record.domain
                    );

                }

                const responseObj = {
                    sysId: record?.sys_id,
                    source: record?.source,
                    response,
                    selectionType: record?.selectionType,
                    selectedProvider: record?.selectedProvider
                };

                if (record?.selectionType !== 'oobSkill') {
                    responseObj.groupName = record?.groupName;
                }

                const failedCapabilities = _getFailedCapabilities(response.details) || [];
                if (failedCapabilities.length > 0) {
                    responseObj.failedSkills = NAAManageLLMAPI.getSkillDataForCapabilities(failedCapabilities);
                }

                result.push(responseObj);
            });

            try {
                NAALlmChangeHistoryUtil.saveSkillProviderChangeHistory({
                    skillList: input.skillList,
                    providerConfigurationId: input.providerConfiguration,
                    result: result,
                    domain: gs.getSession().getCurrentDomainID()
                });

            } catch (e) {
                gs.error("Creation of Audit History failed: " + e.toString());
            }

            return result;

        } else {
            var providerConfigurationId = input.providerConfiguration?.sys_id;
            var naUtil = new sn_nowassist_admin.NowAssistSkillConfig();
            var sessionDomain = naUtil._getCurrentDomainID() || "global";
            if (NAADomainUtil.isRecordDomainSeparationEnabled() &&
                sessionDomain !== "global" &&
                sessionDomain !== input.providerConfiguration.domain) {
                providerConfigurationId = NAAGenAIUtil.upsertProviderConfigurationForDifferentDomain(providerConfigurationId, sessionDomain);
                NAAGenAIUtil.upsertLLMMappingsForDifferentDomain(input?.providerConfiguration?.providers, providerConfigurationId);
            }
            var response = NAAGenAIUtil.setLLMProviderOnSkills({
                sys_id: providerConfigurationId,
                ...input.providerConfiguration
            });
            if (response?.status !== "Error") {
                naUtil.upsertProviderConfigurationStatus(
                    providerConfigurationId,
                    input?.providerConfiguration?.selectedProvider,
                    input?.providerConfiguration?.azureConsentPassed,
                    sessionDomain !== input.providerConfiguration.domain);
            }
            try {
                NAALlmChangeHistoryUtil.saveSkillProviderChangeHistory({
                    skillList: input.skillList,
                    providerConfigurationId: input.providerConfiguration,
                    result: response,
                    domain: gs.getSession().getCurrentDomainID()
                });
            } catch (e) {
                gs.error("Creation of Audit History failed: " + e.toString());
            }

            return response;
        }

        function _getFailedCapabilities(response) {
            var failedStatusSkill = [];
            for (const [key, value] of Object.entries(response)) {
                const capabilityIdToFind = `${key}`;
                if (response[capabilityIdToFind]?.status === "Error") {
                    failedStatusSkill.push(capabilityIdToFind.split(':')[0]);

                }
            }
            return failedStatusSkill;
        }

    } catch (e) {
        gs.error("Set LLM provider is failed: " + e.toString());
    }
}
