var NAAManageModelVersions = {

    LLM: "llm",
    SLM: "slm",
    GENERIC: "generic",

    /**
     * Determines if a capability is LLM-based.
     * @param {string} capabilityId - The ID of the capability to check.
     * @param {Object} capabilityAndDefinitionMap - Map of capability IDs to their definitions.
     * @param {Object} generativeAiDefinitionsMap - Map of generative AI definitions.
     * @param {Object} oneExtendData - Map of capability IDs to their extend data.
     * @returns {boolean} True if the capability is LLM-based, false otherwise.
     */
    isLLMBasedCapability: function(capabilityId, capabilityAndDefinitionMap, generativeAiDefinitionsMap, oneExtendData) {
        const definition = capabilityAndDefinitionMap[capabilityId];
        const hasLLMDefinition = definition && generativeAiDefinitionsMap[definition[0]];
        const hasExtendData = oneExtendData[capabilityId];
        const isNonLLMSkill = !hasLLMDefinition;
        return hasExtendData && !isNonLLMSkill;
    },

    /**
     * Retrieves all skill configurations that have at least one LLM-based capability.
     * @returns {Array<Object>} Array of skill configuration objects with LLM-based capabilities.
     */
    getLLMBasedSkills: function() {
        var skillSuperObject = NAASkillConfigUtil.getSkillSuperObject(null, {
            fetchNAPSkillApplicabilities: false,
            fetchSkillVarsets: false,
            fetchGenAISkillApplicability: false,
            fetchChatExperience: false
        });

        var finalSkillConfigData = [];
        var skillConfigAndCapabilityMap = {};

        for (var skill in skillSuperObject) {
            if (skillSuperObject.hasOwnProperty(skill)) {
                skillConfigAndCapabilityMap[skill] = [skillSuperObject[skill]["skill_id"]];
            }
        }

        var {
            capabilityAndDefinitionMap,
            generativeAiDefinitionsMap
        } = NAASkillConfigUtil.getCapabilityAndDefinitionsMap();

        const oneExtendData = NAAGenAIUtil.getOneExtendDefConfigData();
        skillConfigAndCapabilityMap = NAAManageModelVersions.fetchSkillConfigM2mData(skillConfigAndCapabilityMap);

        Object.keys(skillConfigAndCapabilityMap).forEach(skillConfigSysId => {
            var skillConfigHasAtleastOneLLMCapability =
                skillConfigAndCapabilityMap[skillConfigSysId]?.some(capabilityId => NAAManageModelVersions.isLLMBasedCapability(capabilityId, capabilityAndDefinitionMap, generativeAiDefinitionsMap, oneExtendData));

            if (skillConfigHasAtleastOneLLMCapability) {

                var providerInfo = NAAGenAIUtil.getProviderForSkillConfig(skillConfigSysId);
                if(skillSuperObject[skillConfigSysId]){
                    skillSuperObject[skillConfigSysId].genAiProvider = providerInfo.skillConfigLlmNames;
                    finalSkillConfigData.push(skillSuperObject[skillConfigSysId]);
				}
            }
        });
        return finalSkillConfigData;
    },

    /**
     * Fetches and populates the skill configuration to capability mapping from the M2M table.
     * @param {Object} skillConfigAndCapabilityMap - Map of skill configurations to capability IDs.
     * @returns {Object} Updated map of skill configurations to capability IDs.
     */
    fetchSkillConfigM2mData: function(skillConfigAndCapabilityMap) {
        var skillConfigM2M = new GlideRecord(NAAConstant.CONFIG_SKILL_M2M);
        skillConfigM2M.query();
        while (skillConfigM2M.next()) {
            if (!skillConfigAndCapabilityMap[skillConfigM2M.getValue('skill_config')]) {
                skillConfigAndCapabilityMap[skillConfigM2M.getValue('skill_config')] = [];
            }
            skillConfigAndCapabilityMap[skillConfigM2M.getValue('skill_config')].push(skillConfigM2M.getValue('skill_id'));
        }
        return skillConfigAndCapabilityMap;
    },

    /**
     * Converts an array of model response objects into a mapping keyed by model name.
     *
     * @param {Array<Object>} response - Array of model objects, each containing model, model_type, gen_ai_provider, and model_id.
     * @returns {Object} An object where each key is a model name and the value is an object with model details.
     */
    fetchAllModelsByProviders: function(response) {
        var modelsAndTypes = {};
        response.forEach(i => {
            modelsAndTypes[i.model] = {
                model: i.model,
                modelType: i.model_type,
                genAiProvider: i.gen_ai_provider,
                modelId: i.model_id
            };
        });
        return modelsAndTypes;
    },

    /**
     * Retrieves the source model ID from the modelsAndTypes map for a given version object.
     *
     * @param {Object} modelsAndTypes - Mapping of model names to their details.
     * @param {Object} version - The version object, expected to have source_model_name and model_type properties.
     * @returns {string} The model ID if found, or a default constant based on the model type.
     */
    getSourceModelId: function(modelsAndTypes, version) {
        if (modelsAndTypes[version.source_model_name]) {
            return modelsAndTypes[version.source_model_name]?.modelId;
        } else {
            if (version.model_type === "SLM") {
                return NAAManageModelVersions.SLM;
            } else if (version.model_type === "LLM") {
                return NAAManageModelVersions.LLM;
            }
            return NAAManageModelVersions.GENERIC;
        }
    },

    /**
     * Returns an array of models including special entries for 'All SLM model versions', 'All LLM model versions', and 'All generic model versions',
     * followed by the provided models. Used to populate dropdowns or selection lists.
     *
     * @param {Object} modelsAndTypes - Mapping of model names to their details.
     * @returns {Array<Object>} Array of model objects including 'All' options and the provided models.
     */
    mapModelsIncludingAll: function(modelsAndTypes) {
        var sortedModels = Object.values(modelsAndTypes).sort(function(a, b) {
            return a.model.localeCompare(b.model);
        });
        modelsAndTypes = [{
                model: sn_i18n.Message.getMessage('sn_nowassist_admin', "All SLM model versions"),
                modelType: "SLM",
                all: true,
                modelId: NAAManageModelVersions.SLM
            },
            {
                model: sn_i18n.Message.getMessage('sn_nowassist_admin', "All LLM model versions"),
                modelType: "LLM",
                all: true,
                modelId: NAAManageModelVersions.LLM
            },
            {
                model: sn_i18n.Message.getMessage('sn_nowassist_admin', "All generic model versions"),
                modelType: "GENERIC",
                all: true,
                modelId: NAAManageModelVersions.GENERIC
            }, ...sortedModels
        ];

        return modelsAndTypes;
    },

    /**
     * Determines the source model name based on version data.
     * @param {Object} version - The version object.
     * @returns {string} The source model name.
     */
    _getSourceModelName: function(version) {
        if (version.source_model_name) {
            return version.source_model_name;
        }
        
        if (version.model_type === "SLM") return sn_i18n.Message.getMessage('sn_nowassist_admin', "All SLM model versions");
        if (version.model_type === "LLM") return sn_i18n.Message.getMessage('sn_nowassist_admin', "All LLM model versions");
        return sn_i18n.Message.getMessage('sn_nowassist_admin', "All generic model versions");
    },

    /**
     * Transforms a version object into a standardized format for skills.
     * @param {Object} version - The version object.
     * @param {Object} modelsAndTypes - Map of models and their types.
     * @returns {Object} Transformed version object.
     */
    _transformVersion: function(version, modelsAndTypes) {
        return {
            modelType: version.model_type,
            sourceModel: NAAManageModelVersions._getSourceModelName(version),
            sourceModelId: NAAManageModelVersions.getSourceModelId(modelsAndTypes, version),
            targetModel: version.target_model_name,
            targetModelId: modelsAndTypes[version.target_model_name]?.modelId,
            oobVersion: version.source === "servicenow",
            sysId: version.sysId,
            skillType: version.skill_type,
            resource: version.resource,
            genAiProvider: version.gen_ai_provider
        };
    },

    /**
     * Initializes provider data structure.
     * @param {Array<Object>} providers - List of provider objects.
     * @returns {Object} Initialized provider data map.
     */
    _initializeProviderData: function(providers) {
        var providerData = {};
        providers.forEach((item, index) => {
            providerData[item.id] = {
                sysId: item.id,
                name: item.label,
                expanded: index === 0,
                versions: []
            };
        });
        return providerData;
    },

    /**
     * Fetches and organizes model versions by providers.
     * @param {Array<Object>} providers - List of provider objects with at least 'id' and 'label' properties.
     * @param {Object} filters - Filters to apply when fetching model version mappings.
     * @returns {Array<Object>} Array of provider objects, each containing its model versions and related metadata.
     * @throws {Error} If fetching model version records fails.
     */
    fetchModelVersionsByProviders: function(providers, filters) {
        try {
            var modelsAndTypes = NAAManageModelVersions.fetchAllModelsByProviders(new sn_generative_ai.GenAIModelVersionUtil().getAllTheModelsByProvider());
			var excludedModelsAndTypes = {};
			if(new sn_generative_ai.GenAIModelVersionUtil().getExcludedTargetModelsByProvider){
				excludedModelsAndTypes = NAAManageModelVersions.fetchAllModelsByProviders(new sn_generative_ai.GenAIModelVersionUtil().getExcludedTargetModelsByProvider());
			}
            var data = new sn_generative_ai.GenAIModelVersionUtil().getMappingsByProviders(providers.map(item => item.id), filters);
            
            if (filters.control === "skill") {
                return {
                    versions: data.map(version => NAAManageModelVersions._transformVersion(version, modelsAndTypes))
                };
            }
            
            if (providers) {
                var providerAndMappingData = NAAManageModelVersions._initializeProviderData(providers);
                
                data.forEach(version => {
                    if (providerAndMappingData[version.gen_ai_provider]) {
                        providerAndMappingData[version.gen_ai_provider].versions.push(
                            NAAManageModelVersions._transformVersion(version, modelsAndTypes)
                        );
                    }
                });
                
                return {
                    versions: Object.values(providerAndMappingData),
                    modelsAndTypes: NAAManageModelVersions.mapModelsIncludingAll(modelsAndTypes),
					excludedModelsAndTypes: Object.values(excludedModelsAndTypes),
					hasEditAccess: NAARoleUtil._hasEditAccess()
                };
            }
        } catch (e) {
            gs.error("Failed to fetch model version records - " + e);
            throw new Error("Failed to fetch model version records");
        }
    },
};
