var NowAssistSkillConfig = Class.create();
NowAssistSkillConfig.prototype = {
    initialize: function() {
        this.SKILL_CONFIG = "sn_nowassist_skill_config";
        this.CONSTANTS = new NowAdminAssistMetadata();
        this.SKILL_CONFIG_STATUS = "sn_nowassist_skill_config_status";
        this.SKILL_FAMILY = "sn_nowassist_skill_family";
        this.SKILL_CONFIG_VAR_SET = "sn_nowassist_skill_config_var_set";
        this.SKILL_CONFIG_VAR_SET_UI = "sn_ns_skill_config_var_set_ui";
        this.SKILL_VAR_SET_TEMPLATE = "sn_nowassist_skill_config_type";
        this.SKILL_CONFIG_APPLICABILITY = "sn_nowassist_skill_config_applicability";
        this.GEN_AI_SKILL_APPLICABILITY = "sys_gen_ai_skill_applicability";
        this.NS_ADMIN_INTERNAL_FILTER_KEYS = ['__applicable_for_extended_tables__'];
        this.CACHE_UTIL = new NowAssistCacheUtil();
        this.domainId = gs.getSession().getCurrentDomainID() || "global";
        this.SKILL_CONFIG_CACHE_STORE = 'CONFIG';
        this.APPLICABILITY_CACHE_STORE = 'APPLICABILITY';
		this.ASSET_SUBSCRIPTION_CACHE_STORE = "ASSET_SUBSCRIPTION";
        this.CONFIG_TO_SKILL_M2M = 'sn_ns_config_m2m_skill';
        this.CUSTOMIZE_PROMPT_SCREEN_ID = "a0f24cc94320c2106b5f90cfd7b8f28d";
    },

    /**
     * This method retrieves the details of a skill configuration record along with its associated skill config variables. 
     * The skill config variables can be nested to represent a hierarchical structure. The hierarchical structure of skill config
     * variables represent an override behavior.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * 
     * @return An object of type {@link SkillConfigDetails} that contains the details of the skill configuration record 
     * and its associated skill config variables.
     */
    getSkillConfiguration: function(skillConfigId, domainGr) {
        var result = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId);
        if (!result) {
            var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
            skillConfigGr.addQuery('sys_id', skillConfigId);
            this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
            skillConfigGr.query();
            if (skillConfigGr.next()) {
                result = this._getSkillConfigInfo(skillConfigGr, domainGr);
                this.CACHE_UTIL.setNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId, result);
            }
        }
        // As the cache is not user specific and acl evaulation is done at user level, we are setting it apart from cache
        if(result){
            result.has_access_to_skill = this.getSkillConfigHasAccess(skillConfigId);
        }

		if(NAASkillConfigUtil.checkLicenseForFulfillerSKU()){
			var skillsToBeVisible= NAASkillConfigUtil.getSkillsBasedOnAssetSubscription([result.sys_id]);
			if(!skillsToBeVisible.length){
				return null;
			}
		}

        return result;
    },

    /**
     * Checks if the specified asset has access based on its subscription profile.
     * This method first determines if SKU-based access checks are enabled. If not, access is granted by default.
     * If enabled, it attempts to retrieve the access decision from cache; if not present, it queries the asset subscription table.
     * The result is cached for future lookups.
     *
     * @param {string} assetId - The sys_id of the asset to check access for.
	 * @param {string} assetType - The asset table name
     * @param {string} [subscriptionId=NAAConstant.NOW_ASSIST_FULFILLER_SKU_SUBSCRIPTION_ID] - The subscription profile id to check against (optional, defaults to Fulfiller SKU).
     * @returns {boolean|null} Returns true if access is granted, false if denied, or null if assetId is not provided or required data is missing.
     */
	checkAccessForAssetSubscription:function(assetId, assetType, subscriptionId= NAAConstant.NOW_ASSIST_FULFILLER_SKU_SUBSCRIPTION_ID){
		// First check if we need to query the asset subscription table basead on the SKU license
		
		if(!NAASkillConfigUtil.checkLicenseForFulfillerSKU()){
			return true;
		}
		if(!assetId){
			return null;
		}
		
		try{
			var subscriptionGr= new GlideRecord(NAAConstant.ASSET_SUBSCRIPTION);
			subscriptionGr.addQuery("asset_id",assetId);
            if(assetType){
                subscriptionGr.addQuery("asset_table",assetType);
            }
			subscriptionGr.addQuery("subscription_profile_id",subscriptionId);
			subscriptionGr.query();
			while(subscriptionGr.next()){
				var data = NAAValidator.isTrue(subscriptionGr.getValue("allow"));
				return data;
			}
			return false;
		}catch(e){
			return false;
		}
	},

    /**
     * Check whether skill config has access or not by evaulating ACLs for skill configs
     */
    getSkillConfigHasAccess: function(skillConfigId) {
        try {
            if (sn_one_extend.OneExtendUtil.hasAccessToSkill) {
                return sn_one_extend.OneExtendUtil.hasAccessToSkill(skillConfigId);
            } else {
                return true;
            }
        } catch (e) {
            gs.error("NowAssistAdmin: Error while fetching the access to skill");
            return true;
        }
    },

    /**
     * This method retrieves the parent of a skill configuration. If parent is available in skill config, we will return it, 
     * Otherwise we will look up for the parent in skill config default vars.
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @return An object that contains the details of the skill configuration parent record.
     */
    getSkillConfigParent: function(skillConfigId) {
        return NAASkillConfigUtil.getSkillConfigParent(skillConfigId);
    },

    /**
     * This method retrieves skill guided setup status for a given skill config and varset
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @param {String} skillConfigVarSetId(sn_nowassist_skill_config_var_set)
     * @return An object containing skill config guided setup status.
     */
    getSkillConfigGuidedSetupStatus: function(skillConfigId, skillConfigVarSetId) {
        return NAAGuidedSetupUtil._getGuidedSetupStatus(skillConfigId, skillConfigVarSetId);
    },

    /**
     * This method skill config applicability record information, 
     * @param skillConfigId(sn_nowassist_skill_config)
     * @param domainGr Any glide record with domain. The same domain will be applied on the query while fetching the skill applicabilty record info.
     * @return An object that contains the details of the skill configuration applicability record.
     */
    getSkillConfigApplicability: function(skillConfigId, domainGr, queryNoDomain = false) {
        var skillConfigApplicabilityGr = new GlideRecord(this.SKILL_CONFIG_APPLICABILITY);
        skillConfigApplicabilityGr.addQuery("skill_config", skillConfigId);
        this._applyQuery(skillConfigApplicabilityGr, domainGr, queryNoDomain);
        while (skillConfigApplicabilityGr.next()) {
            return {
                filterParameters: skillConfigApplicabilityGr.getValue("filter_parameters")
            };
        }
        return null;
    },

    /**
     * This method clears parent value in skill config and stores the same value in var. 
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     */
    clearSkillConfigParent: function(skillConfigId) {
        try {
            var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
            skillConfigGr.get(skillConfigId);
            if (skillConfigGr.parent) {
                var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
                skillConfigVarSetGr.addQuery("config_type", this.CONSTANTS.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE);
                skillConfigVarSetGr.addQuery("skill_config", skillConfigId);
                skillConfigVarSetGr.query();
                if (skillConfigVarSetGr.getRowCount() > 0) {
                    while (skillConfigVarSetGr.next()) {
                        skillConfigVarSetGr.vars.source_skill_config = skillConfigGr.parent;
                        skillConfigVarSetGr.update();
                    }
                } else {
                    var naaUtil = new sn_nowassist_admin.SkillBuilderNaaUtils();
                    var newSkillConfigVarSetId = naaUtil.upsertDefaultCapabilityDefinitionToSkillConfig(skillConfigId);
                    if (newSkillConfigVarSetId) {
                        skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
                        skillConfigVarSetGr.get(newSkillConfigVarSetId);
                        skillConfigVarSetGr.vars.source_skill_config = skillConfigGr.parent;
                        skillConfigVarSetGr.update();
                    }

                }
                skillConfigGr.setValue("parent", "");
                skillConfigGr.update();
            }
        } catch (e) {
            gs.error("NowAssistSkillConfig: Failed to clear skill config parent value")
        }
    },

    /**
     * This method sets the applicability filter values for given skill config id, 
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @param {Object} filterParameters
     */
    setSkillConfigApplicabilityFilters: function(skillConfigId, filterParameters) {
        try {
            const skillConfigApplicablityGr = new GlideRecord(this.SKILL_CONFIG_APPLICABILITY);
            skillConfigApplicablityGr.addQuery("skill_config", skillConfigId);
            skillConfigApplicablityGr.setValue("filter_parameters", JSON.stringify(filterParameters));
            skillConfigApplicablityGr.updateMultiple();
        } catch (e) {
            gs.error("NowAssistSkillConfig: Failed to set skill config applicability filters")
        }
    },

    /**
     * This method returns whether skill config is editable or not based on its parent value. Parent value will be looked up in Parent column, 
     * If parent value is empty, we will look up for the parent in skill config default vars. If it is not available in both we will return false.
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @return An boolean whether Skill config is editable or not.
     */
    isSkillConfigEditable: function(skillConfigId) {
        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.get(skillConfigId);
        if (!gs.nil(skillConfigGr.parent)) {
            return true;
        }
        // If the parent on the skill config is not available, check in the varset.
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery("config_type", this.CONSTANTS.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE);
        skillConfigVarSetGr.addQuery("skill_config", skillConfigId);
        skillConfigVarSetGr.query();
        while (skillConfigVarSetGr.next()) {
            return !gs.nil(skillConfigVarSetGr.vars.source_skill_config);
        }
        return false;
    },

    /**
     * This method retrieves the skill configurations for all the records that are associated with the given skillId.
     * The returned array contains objects of individual skill configurations. Every such object contains details of a skill configuration
     * and its associated variables. 
     * 
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * 
     * @return {Array} Contains array of objects where each object represents details of a skill configuration.
     */
    getSkillConfigurationsBySkillId: function(skillId, domainGr) {
        var configM2MSkill = new GlideRecord(this.CONFIG_TO_SKILL_M2M);
        configM2MSkill.addQuery('skill_id', skillId);
        this._applyRecordBasedDomainQuery(configM2MSkill, domainGr);
        configM2MSkill.query();

        var skillConfigIds = [];
        while (configM2MSkill.next()) {
            skillConfigIds.push(configM2MSkill.getValue('skill_config'));
        }

        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.addQuery('skill_id', skillId).addOrCondition('sys_id', 'IN', skillConfigIds.join(','));
        this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
        skillConfigGr.query();

        var skillConfigurations = [];
        while (skillConfigGr.next()) {
            var skillConfiguration = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigGr.getValue('sys_id'));
            if (!skillConfiguration) {
                skillConfiguration = this._getSkillConfigInfo(skillConfigGr, domainGr);
                this.CACHE_UTIL.setNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigGr.getUniqueValue(), skillConfiguration);
            }
            // As the cache is not user specific and acl evaulation is done at user level, we are setting it apart from cache
            skillConfiguration.has_access_to_skill = this.getSkillConfigHasAccess(skillConfigGr.getValue('sys_id'));
            skillConfigurations.push(skillConfiguration);
        }

        return skillConfigurations;
    },

    /**
     * This method retrieves the details of all skill variables for the given skillConfigId. If the 'shouldIncludeVariableOverrides' flag is true,
     * it includes the variables override sets for all the variable sets. 
     * 
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @param {Boolean} shouldIncludeVariableOverrides - Indicates whether override sets should be included for the variables.
     * 
     * @return {Array} Contains array of variable set objects.
     */
    getSkillConfigurationVariables: function(skillConfigId, shouldIncludeVariableOverrides, domainGr) {
        // Get from cache
        var configData = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId);
        if (configData) {
            return configData.variable_sets;
        }

        // Get from DB
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
        skillConfigVarSetGr.addNullQuery('parent');
        skillConfigVarSetGr.orderBy('order');
        this._applyRecordBasedDomainQuery(skillConfigVarSetGr, domainGr);

        skillConfigVarSetGr.query();

        var skillConfigVariables = [];

        while (skillConfigVarSetGr.next()) {
            skillConfigVariables.push(this._getVariableSetInfo(skillConfigVarSetGr, shouldIncludeVariableOverrides));
        }

        return skillConfigVariables;
    },

    /**
     * Checks if the given skillConfigId record is active.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @return {Boolean}
     */
    isSkillConfigurationActive: function(skillConfigId, domainGr) {
        var configData = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId);
        if (configData) {
            return configData.active;
        }

        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.addQuery('sys_id', skillConfigId);
        this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
        skillConfigGr.query();
        if (skillConfigGr.next()) {
            var skillConfigStatus = this._getSkillConfigStatusInfo(skillConfigGr.getValue('sys_id'), domainGr);
			if(NAASkillConfigUtil.checkLicenseForFulfillerSKU()){
				var skillsToBeVisible= NAASkillConfigUtil.getSkillsBasedOnAssetSubscription([skillConfigGr.getValue('sys_id')]);
				if(!skillsToBeVisible.length){
					return false;
				}
			}
            return skillConfigStatus ? skillConfigStatus.active === "1" : skillConfigGr.getValue('active') === "1";
        }
        return false;
    },

    /**
     * Checks if the skill configuration with the given record ID is enabled in product.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @return {Boolean}
     */
    isSkillConfigurationEnabledInProduct: function(skillConfigId, domainGr) {
        var configData = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId);
        if (configData) {
            return configData.in_product_active;
        }

        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.addQuery('sys_id', skillConfigId);
        this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
        skillConfigGr.query();
        if (skillConfigGr.next()) {
            var skillConfigStatus = this._getSkillConfigStatusInfo(skillConfigGr.getValue('sys_id'), domainGr);
            return skillConfigStatus ? skillConfigStatus.in_product_active === "1" : skillConfigGr.getValue('in_product_active') === "1";
        }
        return false;
    },

    /**
     * Checks if the skill configuration with the given record ID is enabled in mobile.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @return {Boolean}
     */
    isSkillConfigurationEnabledInMobile: function(skillConfigId, domainGr) {
        var configData = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId);
        if (configData && !gs.nil(configData.in_mobile_active)) {
            return configData.in_mobile_active;
        }

        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.addQuery('sys_id', skillConfigId);
        this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
        skillConfigGr.query();
        if (skillConfigGr.next()) {
            var skillConfigStatus = this._getSkillConfigStatusInfo(skillConfigGr.getValue('sys_id'), domainGr);
            return skillConfigStatus ? skillConfigStatus.in_mobile_active === "1" : false;
        }
        return false;
    },

    /**
     * Checks if the skill configuration with the given record ID is enabled in Now Assist Panel.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     * @return {Boolean}
     */
    isSkillConfigurationEnabledInNowAssistPanel: function(skillConfigId, domainGr) {
        try {
            var configData = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillConfigId);

            if (configData && configData.nap_active !== undefined) {
                return configData.nap_active;
            }

            var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
            skillConfigGr.addQuery('sys_id', skillConfigId);
            this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
            skillConfigGr.query();

            if (skillConfigGr.next()) {
                var napSkillApplicability = this._getNAPSkillApplicabilities(skillConfigGr, domainGr);
                return this._getNowAssistPanelActiveStatus(napSkillApplicability, domainGr);
            }

            return false;
        } catch (e) {
            return false;
        }
    },

    /**
     * Retrieves and returns the first matching skill configuration based on specific criteria.
     *
     * This method retrieves the first matching skill configuration by following these steps:
     *
     * 1. It searches for `sn_nowassist_skill_config_applicability` records whose `skill_config.skill_id` matches the provided `skillId`.
     * 2. Among the matching records, it evaluates each `applicabilityGR.filter_parameters` to check if it is 
     *  a subset of the provided `filter` or exactly matches based on the provided `strictMatch` flag.
     *  -> If `strictMatch` is false and the `filter_parameters` is a subset of the given `filter`, it's considered a match.
     *  -> If `strictMatch` is true and the `filter_parameters` is exactly deeply similar to `filter`, it’s considered a match.
     *
     * @param {String} skillId - The ID of the skill.
     * @param {Object} filter - A filter to match against.
     * @param {boolean} strictMatch - decides whether the comparison between filter_parameters and filter is a subset match or a strict match.
     * 
     * @returns {Object|null} The skill configuration that matches the criteria, or `null` if no match is found.
     */

    getSkillConfigBySkillIdAndFilter: function(skillId, filter, strictMatch, recordGr) {
        if (strictMatch === undefined) {
            strictMatch = true;
        }
        return this.getSkillConfigBySkillIdAndFilters(skillId, [filter], strictMatch, recordGr);
    },

    /**
     * Retrieves and returns the all matching skill configuration based on specific criteria.
     *
     * This method retrieves the all matching skill configuration by following these steps:
     *
     * 1. It searches for `sn_nowassist_skill_config_applicability` records whose `skill_config.skill_id` matches the provided `skillId`.
     * 2. Among the matching records, it evaluates each `applicabilityGR.filter_parameters` to check if it is 
     *	a subset of the provided `filter` or exactly matches based on the provided `strictMatch` flag.
     *	-> If `strictMatch` is false and the `filter_parameters` is a subset of the given `filter`, it's considered a match.
     *	-> If `strictMatch` is true and the `filter_parameters` is exactly deeply similar to `filter`, it’s considered a match.
     *
     * @param {String} skillId - The ID of the skill.
     * @param {Object} filter - A filter to match against.
     * @param {boolean} strictMatch - decides whether the comparison between filter_parameters and filter is a subset match or a strict match.
     * 
     * @returns {Object|null} The skill configurations that matches the criteria, or `null` if no match is found.
     */

    getSkillConfigurationsBySkillIdAndFilters: function(skillId, filter, strictMatch, recordGr) {
        if (strictMatch === undefined) {
            strictMatch = true;
        }
        if (gs.nil(skillId)) {
            return [];
        }
        var skillConfigApplicabilityRecordsInfo = this._getSkillConfigApplicabilityRecordsInfo(skillId, recordGr);
        return this._getSkillConfigByFilters([filter], strictMatch, skillConfigApplicabilityRecordsInfo, recordGr, true);
    },

    /**
     * Retrieves and returns the first matching skill configuration based on specific criteria.
     *
     * This method retrieves the first matching skill configuration by following these steps:
     *
     * 1. It searches for `sn_nowassist_skill_config_applicability` records whose `skill_config.skill_id` matches the provided `skillId`.
     * 2. Among the matching records, it evaluates each `applicabilityGR.filter_parameters` to check 
     *    if it is a subset of any of the provided filter objects in the `filters` array or if it is an 
     *    exact match based on the provided `strictMatch` flag. 
     *    -> If `strictMatch` is false and the `filter_parameters` is a subset of either of the given filter Objects in the `filters` array, it's considered a match.
     *    -> If `strictMatch` is true and the `filter_parameters` is exactly deeply similar to either of the given filter Objects in the `filter` array, it’s considered a match.
     *
     * @param {String} skillId - The ID of the skill.
     * @param {Object} filters - A set of filters to match against.
     * @param {boolean} strictMatch - decides whether the comparison between filter_parameters and filter is a subset match or a strict match.
     * 
     * @returns {Object|null} The skill configuration that matches the criteria, or `null` if no match is found.
     */
    getSkillConfigBySkillIdAndFilters: function(skillId, filters, strictMatch, recordGr) {
        if (strictMatch === undefined) {
            strictMatch = true;
        }
        if (gs.nil(skillId)) {
            return [];
        }
        var skillConfigApplicabilityRecordsInfo = this._getSkillConfigApplicabilityRecordsInfo(skillId, recordGr);
        return this._getSkillConfigByFilters(filters, strictMatch, skillConfigApplicabilityRecordsInfo, recordGr);
    },

    /**
     * Retrieves and returns the first matching skill configuration based on specific criteria.
     *
     * This method retrieves the first matching skill configuration by following these steps:
     *
     * 1. It searches for `sn_nowassist_skill_config_applicability` records whose `skill_config.skill_id` matches the provided `skillId`.
     * 2. Among the matching records, it evaluates each `applicabilityGR.filter_parameters` to check if it 
     *    is a subset/exact match of the provided `filters` object/array.
     *    -> If `strictMatch` is false and the `filter_parameters` is a subset of the any filter in `filters` array or a subset of the filters object, it's considered a match.
     *    -> If `strictMatch` is true and the `filter_parameters` is an exact key to key and key to value match of either of the filter objects in the `filters` array or with the `filters` object, it’s considered a match.
     * 
     * 3. Additionally, as a specific use-case, if the provided `filters` contain a key named `table` and no matches are found for that table name, the method extends its search to the parent table.
     * 4. If a valid record is found for the base table that satisfies the filters, it checks if that applicability record is applicable
     *    for its extended tables based on the `__applicable_for_extended_tables__` filter parameter.
     *      - Only if the `__applicable_for_extended_tables__` key is declared and set to false will the record be considered in-applicable.
     *
     * @param {String} skillId - The ID of the skill.
     * @param {Object|Array} filters - A single filter object or an array of filters to match against.
     * @param {boolean} strictMatch - decides whether the comparison between filter_parameters and filter is a subset match or a strict match.
     * 
     * @returns {Object|null} The skill configuration that matches the criteria, or `null` if no match is found.
     */
    getSkillConfigurationWithBaseTableFallback: function(skillId, filters, strictMatch, recordGr) {
        if (gs.nil(skillId)) {
            return {};
        }
        if (strictMatch === undefined) {
            strictMatch = true;
        }
        try {
            if (recordGr && recordGr.getValue("sys_domain") && !gs.nil(GlideApplicationProperty.getValue("domain.llm.usage.entitled")) &&
                GlideApplicationProperty.getValue("domain.llm.usage.entitled", recordGr.getValue("sys_domain").toString()).toString() == "false") {
                return false;
            }
        } catch (error) {
            gs.info("NAA: Error while getting the application property value of domain.llm.usage.entitled");
        }

        var skillConfigApplicabilityRecordsInfo = this._getSkillConfigApplicabilityRecordsInfo(skillId, recordGr);
        var filterContext = Array.isArray(filters) ? filters : [filters];
        return this._getSkillConfigurationWithBaseTableFallback(filterContext, strictMatch, false, skillConfigApplicabilityRecordsInfo, recordGr);
    },

    /**
     * Retrieves and returns ALL matching skill configurations based on specific criteria.
     *
     * This method retrieves all matching skill configurations by following these steps:
     *
     * 1. It searches for `sn_nowassist_skill_config_applicability` records whose `skill_config.skill_id` matches the provided `skillId`.
     * 2. Among the matching records, it evaluates each `applicabilityGR.filter_parameters` to check if it 
     *    is a subset/exact match of the provided `filters` object/array.
     *    -> If `strictMatch` is false and the `filter_parameters` is a subset of the any filter in `filters` array or a subset of the filters object, it's considered a match.
     *    -> If `strictMatch` is true and the `filter_parameters` is an exact key to key and key to value match of either of the filter objects in the `filters` array or with the `filters` object, it's considered a match.
     * 
     * 3. Additionally, as a specific use-case, if the provided `filters` contain a key named `table` and no matches are found for that table name, the method extends its search to the parent table.
     * 4. If a valid record is found for the base table that satisfies the filters, it checks if that applicability record is applicable
     *    for its extended tables based on the `__applicable_for_extended_tables__` filter parameter.
     *      - Only if the `__applicable_for_extended_tables__` key is declared and set to false will the record be considered in-applicable.
     *
     * @param {String} skillId - The ID of the skill.
     * @param {Object|Array} filters - A single filter object or an array of filters to match against.
     * @param {boolean} strictMatch - decides whether the comparison between filter_parameters and filter is a subset match or a strict match.
     * 
     * @returns {Array} Array of skill configurations that match the criteria, or empty array if no matches are found.
     */
    getAllSkillConfigurationsWithBaseTableFallback: function(skillId, filters, strictMatch, recordGr) {
        if (gs.nil(skillId)) {
            return [];
        }
        if (strictMatch === undefined) {
            strictMatch = true;
        }
        try {
            if (recordGr && recordGr.getValue("sys_domain") && !gs.nil(GlideApplicationProperty.getValue("domain.llm.usage.entitled")) &&
                GlideApplicationProperty.getValue("domain.llm.usage.entitled", recordGr.getValue("sys_domain").toString()).toString() == "false") {
                return [];
            }
        } catch (error) {
            gs.info("NAA: Error while getting the application property value of domain.llm.usage.entitled");
        }

        var skillConfigApplicabilityRecordsInfo = this._getSkillConfigApplicabilityRecordsInfo(skillId, recordGr);
        var filterContext = Array.isArray(filters) ? filters : [filters];
        return this._getAllSkillConfigurationsWithBaseTableFallback(filterContext, strictMatch, false, skillConfigApplicabilityRecordsInfo, recordGr);
    },

    _applyQuery: function(recordGr, domainGr, queryNoDomain) {
        if (NAADomainUtil.isRecordDomainSeparationEnabled()) {
            if (queryNoDomain) {
                this._applyIgnoreDomainOnGr(recordGr);
            } else {
                this._applyRecordBasedDomainQuery(recordGr, domainGr);
                recordGr.query();
            }
        } else
            recordGr.query();
    },

	/**
     * Deletes duplicate status records for the given skill config status sys_id, aggregates role and active fields,
     * and updates the remaining status record with the combined values.
     *
     * @param {String} oobSkillConfigStatusSysId - The sys_id of the skill config status record to retain and update.
     * @returns {Boolean} - Result of the update operation on the retained record.
     */
	deleteDuplicateStatusRecords:function(oobSkillConfigStatusSysId){
		try{
			if(!oobSkillConfigStatusSysId){
				return null;
			}
			var statusGr=new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
			statusGr.get(oobSkillConfigStatusSysId);
			var skillConfigId=statusGr.getValue("skill_config");
			var active=statusGr.getValue("active")==="1";
			var inProductActive=statusGr.getValue("in_product_active")==="1";
			var inMobileActive=statusGr.getValue("in_mobile_active")==="1";
			var inProductRoles=statusGr.getValue("in_product_roles");
			var inMobileRoles=statusGr.getValue("in_mobile_roles");
			var allStatusRecords = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
			allStatusRecords.addQuery("skill_config",skillConfigId);
			allStatusRecords.addQuery("sys_id", "!=", oobSkillConfigStatusSysId);
			allStatusRecords.query();
			while(allStatusRecords.next()){
				active = active || allStatusRecords.getValue("active")==="1";
				inProductActive= inProductActive || allStatusRecords.getValue("in_product_active")==="1";
				inMobileActive= inMobileActive || allStatusRecords.getValue("in_mobile_active")==="1";
				if(allStatusRecords.getValue("in_product_roles")){
					inProductRoles= this._getInProduceOrMobileRolesFromStatus(inProductRoles,allStatusRecords,"in_product_roles");
				}
				if(allStatusRecords.getValue("in_mobile_roles")){
					inMobileRoles = this._getInProduceOrMobileRolesFromStatus(inMobileRoles,allStatusRecords,"in_mobile_roles");
				}
				allStatusRecords.deleteRecord();
			}
			return this._updateData(statusGr,active,inProductActive,inMobileActive,inProductRoles,inMobileRoles);
		}catch(e){
			gs.error('NowAssistSkillConfig: Unable to delete the duplicate the status records: ' + e.toString());
		}
	},

	_getInProduceOrMobileRolesFromStatus:function(roles,allStatusRecords,key){
		return roles? roles.concat(",",allStatusRecords.getValue(key)): allStatusRecords.getValue(key);
	},

	_updateData:function(statusGr,active,inProductActive,inMobileActive,inProductRoles,inMobileRoles){
		try{
			statusGr.setValue("active",active);
			statusGr.setValue("in_product_active",inProductActive);
			statusGr.setValue("in_mobile_active",inMobileActive);
			statusGr.setValue("in_product_roles",inProductRoles);
			statusGr.setValue("in_mobile_roles",inMobileRoles);
			return statusGr.update();
		}catch(e){
			gs.error('NowAssistSkillConfig: Unable to update the status record from "_updateData" API: ' + e.toString());
		}
		
	},

    // Sorting the array based on skill_config_update_date in descending order
    _sortApplicabilities: function(skillConfigApplicabilityRecords) {

        // Sorting the array based on skill_config_update_date in descending order
        skillConfigApplicabilityRecords.sort((a, b) =>
            new Date(b.latest_update_date) - new Date(a.latest_update_date)
        );

        // Removing skill_config_update_date from each object
        skillConfigApplicabilityRecords = skillConfigApplicabilityRecords.map(({
            latest_update_date,
            ...rest
        }) => rest);

        return skillConfigApplicabilityRecords;
    },

    /**
     * Retrieves skill configuration records from the skill configuration table (this.SKILL_CONFIG).
     * 
     * Applies domain-level filtering using the _applyQuery method, queries the database using GlideRecord,
     * and returns a map of skill configuration records keyed by their sys_id.
     * 
     * @param {Array<String>} skillConfigIds - List of sys_ids (string values) of the skill configuration records to fetch.
     * @param {GlideRecord|null} domainGr - (Optional) Domain GlideRecord to use in query filtering. If not used, pass `null`.
     * @param {Boolean} queryNoDomain - If true, fetches data regardless of domain; otherwise, respects domain filtering.
     * 
     * @returns {Object} skillConfigMap - An object where keys are skill config sys_ids and values are objects with:
     *    - {String} sys_id: The sys_id of the skill config record.
     *    - {String} skill_id: The skill_id associated with the skill config.
     *    - {String} skill_config_update_date: The sys_updated_on timestamp of the record.
     * 
     * @example
     * // Example usage:
     * var skillConfigIds = ['abc123', 'def456', 'ghi789'];
     * var domainGr = new GlideRecord('domain');
     * domainGr.get('sys_id', 'domain123');  // Optional domain filtering
     * var queryNoDomain = false;
     * 
     * var skillConfigs = myScriptHelper._getSkillConfigs(skillConfigIds, domainGr, queryNoDomain);
     * 
     * // Output:
     * // {
     * //   'abc123': { sys_id: 'abc123', skill_id: 'skill_1', skill_config_update_date: '2024-12-01 08:45:00' },
     * //   'def456': { sys_id: 'def456', skill_id: 'skill_2', skill_config_update_date: '2024-11-30 14:21:00' }
     * // }
     */
    _getSkillConfigs: function(skillConfigIds, domainGr, queryNoDomain) {
        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.addQuery('sys_id', 'IN', skillConfigIds);
        this._applyQuery(skillConfigGr, domainGr, queryNoDomain);
        skillConfigGr.query();

        // Map skillConfig records by sys_id for quick lookup
        var skillConfigMap = {};
        while (skillConfigGr.next()) {
            skillConfigMap[skillConfigGr.getValue('sys_id')] = {
                sys_id: skillConfigGr.getValue('sys_id'),
                skill_id: skillConfigGr.getValue('skill_id'),
                skill_config_update_date: skillConfigGr.getValue('sys_updated_on').replace(' ', 'T')
            };
        }

        return skillConfigMap;
    },


    /**
     * Retrieves status records for the provided Skill Configuration IDs from the SKILL_CONFIG_STATUS table.
     * 
     * Applies domain-level filtering using the _applyQuery method, and returns a map of status details keyed by
     * the associated skill configuration ID.
     * 
     * @param {Array<String>} skillConfigIds - List of sys_ids of skill configurations for which status records are needed.
     * @param {GlideRecord|null} domainGr - (Optional) Domain GlideRecord for domain filtering. Pass `null` if not applicable.
     * @param {Boolean} [queryNoDomain=false] - If true, disables domain filtering; otherwise applies domain-based query.
     * 
     * @returns {Object} skillConfigStatusMap - An object with skill_config sys_ids as keys and objects as values, containing:
     *    - {String} sysId: The sys_id of the status record.
     *    - {String} active: Whether the skill config is active ("true"/"false").
     *    - {String} in_product_active: Whether it's active in product.
     *    - {String} in_product_roles: Comma-separated roles allowed in product.
     *    - {String} in_mobile_active: Whether it's active on mobile.
     *    - {String} in_mobile_roles: Comma-separated roles allowed on mobile.
     * 
     * @example
     * // Example usage:
     * var skillConfigIds = ['abc123', 'def456'];
     * var domainGr = new GlideRecord('domain');
     * domainGr.get('sys_id', 'domain456');
     * 
     * var statuses = myScriptHelper._getSkillConfigStatuses(skillConfigIds, domainGr, false);
     * 
     * // Output:
     * // {
     * //   'abc123': {
     * //     sysId: 'status_1',
     * //     active: 'true',
     * //     in_product_active: 'true',
     * //     in_product_roles: 'admin,editor',
     * //     in_mobile_active: 'false',
     * //     in_mobile_roles: ''
     * //   },
     * //   'def456': {
     * //     sysId: 'status_2',
     * //     active: 'false',
     * //     in_product_active: 'false',
     * //     in_product_roles: '',
     * //     in_mobile_active: 'true',
     * //     in_mobile_roles: 'mobile_user'
     * //   }
     * // }
     */
    _getSkillConfigStatuses: function(skillConfigIds, domainGr, queryNoDomain = false) {
        var skillConfigStatusGr = new GlideRecord(this.SKILL_CONFIG_STATUS);
        skillConfigStatusGr.addQuery('skill_config', 'IN', skillConfigIds);
        this._applyQuery(skillConfigStatusGr, domainGr, queryNoDomain);

        var skillConfigStatusMap = {};
        while (skillConfigStatusGr.next()) {
            skillConfigStatusMap[skillConfigStatusGr.getValue('skill_config')] = {
                sysId: skillConfigStatusGr.getValue('sys_id'),
                active: skillConfigStatusGr.getValue('active'),
                in_product_active: skillConfigStatusGr.getValue('in_product_active'),
                in_product_roles: skillConfigStatusGr.getValue('in_product_roles'),
                in_mobile_active: skillConfigStatusGr.getValue('in_mobile_active'),
                in_mobile_roles: skillConfigStatusGr.getValue('in_mobile_roles'),
                skill_config_status_update_date: skillConfigStatusGr.getValue('sys_updated_on').replace(' ', 'T')
            };
        }

        return skillConfigStatusMap;
    },

    /**
     * Retrieves applicability records from the SKILL_CONFIG_APPLICABILITY table that are linked to skill configurations.
     * 
     * Applies domain filtering using the _applyQuery method and sorts results based on the 'order' field.
     * Parses the 'filter_parameters' field (assumed to be a JSON string) and returns a map of applicability records.
     * 
     * @param {GlideRecord|null} domainGr - (Optional) Domain GlideRecord for filtering. Pass `null` if no specific domain.
     * @param {Boolean} queryNoDomain - If true, disables domain filtering; if false, respects domain filtering logic.
     * @param {Array<String>} skillConfigIds - Array of skill config sys_ids to filter applicability records.
     * 
     * @returns {Object} applicabilitiesMap - A JavaScript object keyed by applicability sys_ids, with values:
     *    - {String} sysId: The sys_id of the applicability record.
     *    - {Object} filterParameters: Parsed JSON object from the 'filter_parameters' field.
     *    - {String} skillConfig: The sys_id of the associated skill_config.
     */ 

    _listApplicabilities: function(domainGr, queryNoDomain, skillConfigIds) {
        var skillConfigApplicabilityGr = new GlideRecord(this.SKILL_CONFIG_APPLICABILITY);
        skillConfigApplicabilityGr.addNotNullQuery('skill_config');
        skillConfigApplicabilityGr.addQuery('skill_config', 'IN', skillConfigIds);
        skillConfigApplicabilityGr.orderBy('order');
        this._applyQuery(skillConfigApplicabilityGr, domainGr, queryNoDomain);

        var applicabilitiesMap = {};
        while (skillConfigApplicabilityGr.next()) {
            applicabilitiesMap[skillConfigApplicabilityGr.getValue('sys_id')] = {
                sysId: skillConfigApplicabilityGr.getValue('sys_id'),
                filterParameters: JSON.parse(skillConfigApplicabilityGr.getValue('filter_parameters')),
                skillConfig: skillConfigApplicabilityGr.getValue('skill_config'),
            };
        }

        return applicabilitiesMap;
    },

    /**
     * Helper method to get ALL skill config IDs linked to a specific skill.
     * 
     * This method checks TWO sources to ensure complete coverage:
     * 1. Direct skill_id reference in sn_nowassist_skill_config table
     * 2. M2M relationships in sn_ns_config_m2m_skill table
     * 
     * 
     * 
     * @param {String} skillId - The skill ID to search for (e.g., 'incident_summarizer')
     * @param {GlideRecord|null} domainGr - Domain GlideRecord for filtering. Pass null for no domain filtering.
     * @param {Boolean} queryNoDomain - If true, bypasses domain filtering; if false, applies domain-based query.
     * 
     * @returns {Array<String>} Array of skill config sys_ids linked to the skill from both direct and M2M relationships.
     *                          Duplicates are automatically removed.
     * 
     * @example
     * var configIds = this._getSkillConfigIdsForSkill('incident_summarizer', domainGr, false);
     * // Returns: ['config_001', 'config_002', 'config_003']
     * // Includes configs from both skill_config.skill_id and M2M table
     * 
     * @private
     */
    _getSkillConfigIdsForSkill: function(skillId, domainGr, queryNoDomain) {
        var skillConfigIds = [];
        
        // 1. Get skill configs with direct skill_id reference in sn_nowassist_skill_config table
        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.addQuery('skill_id', skillId);
        this._applyQuery(skillConfigGr, domainGr, queryNoDomain);
        
        while (skillConfigGr.next()) {
            skillConfigIds.push(skillConfigGr.getValue('sys_id'));
        }
        
        // 2. Get skill configs from M2M relationships in sn_ns_config_m2m_skill table
        var configAndSkillM2MGr = new GlideRecord(this.CONFIG_TO_SKILL_M2M);
        configAndSkillM2MGr.addQuery('skill_id', skillId);
        this._applyQuery(configAndSkillM2MGr, domainGr, queryNoDomain);
        
        while (configAndSkillM2MGr.next()) {
            var configId = configAndSkillM2MGr.getValue('skill_config');
            // Avoid duplicates (in case config exists in both places)
            if (skillConfigIds.indexOf(configId) === -1) {
                skillConfigIds.push(configId);
            }
        }
        
        return skillConfigIds;
    },


    /**
     * Retrieves M2M (many-to-many) relationships between skill configurations and a specific skill.
     * 
     * Queries the CONFIG_TO_SKILL_M2M table to find links between the given skill ID and a list of skill configuration IDs.
     * Applies optional domain filtering using the _applyQuery method.
     * 
     * @param {Array<String>} skillConfigIds - List of skill configuration sys_ids to check for associations.
     * @param {String} skillId - The sys_id of the skill to check associations with.
     * @param {GlideRecord|null} domainGr - (Optional) Domain GlideRecord used for domain filtering. Pass `null` if not applicable.
     * @param {Boolean} queryNoDomain - Whether to skip domain filtering. `true` skips it, `false` applies domain filtering.
     * 
     * @returns {Object} skillM2MMap - A JavaScript object where keys are skill_config sys_ids (from input list)
     *                                  that are associated with the given skillId. Values are all set to `true`.
     * 
     * @example
     * // Example usage:
     * var skillConfigIds = ['cfg_001', 'cfg_002', 'cfg_003'];
     * var skillId = 'skill_abc';
     * var domainGr = new GlideRecord('domain');
     * domainGr.get('sys_id', 'domain123');
     * 
     * var result = myScriptHelper._listSkillM2M(skillConfigIds, skillId, domainGr, false);
     * 
     * // Output:
     * // {
     * //   'cfg_001': true,
     * //   'cfg_003': true
     * // }
     * 
     * // This means cfg_001 and cfg_003 are associated with skill_abc, while cfg_002 is not.
     */
    _listSkillM2M: function(skillConfigIds, skillId, domainGr, queryNoDomain) {
        var configAndSkillM2MGr = new GlideRecord(this.CONFIG_TO_SKILL_M2M);
        configAndSkillM2MGr.addQuery('skill_config', 'IN', skillConfigIds);
        configAndSkillM2MGr.addQuery('skill_id', skillId);
        this._applyQuery(configAndSkillM2MGr, domainGr, queryNoDomain);

        var skillM2MMap = {};
        while (configAndSkillM2MGr.next()) {
            skillM2MMap[configAndSkillM2MGr.getValue('skill_config')] = true;
        }

        return skillM2MMap;
    },


    /**
     * Determines whether a skill is not active based on its status or configuration.
     *
     * The logic checks the 'active' status from the `skillConfigStatus` object if it exists.
     * If `skillConfigStatus` is not available, it checks the `active` field from the `skillConfig` object.
     *
     * @param {Object|null} skillConfigStatus - Optional status object (e.g., from SKILL_CONFIG_STATUS table), may contain:
     *        - {String} active: "1" for active, "0" for inactive.
     * @param {Object} skillConfig - Required skill configuration object (e.g., from SKILL_CONFIG table), must contain:
     *        - {String} active: "1" or "0".
     *
     * @returns {Boolean} - Returns true if the skill is not active; false otherwise.
     *
     * @example
     * // Case 1: Status exists and shows inactive
     * var skillConfigStatus = { active: "0" };
     * var skillConfig = { active: "1" };
     * _isSkillNotActive(skillConfigStatus, skillConfig); // true
     *
     * // Case 2: Status is missing, but config says inactive
     * var skillConfigStatus = null;
     * var skillConfig = { active: "0" };
     * _isSkillNotActive(skillConfigStatus, skillConfig); // true
     *
     * // Case 3: Both indicate active
     * var skillConfigStatus = { active: "1" };
     * var skillConfig = { active: "1" };
     * _isSkillNotActive(skillConfigStatus, skillConfig); // false
     */
    _isSkillNotActive: function(skillConfigStatus, skillConfig) {
        if (skillConfigStatus) {
            return skillConfigStatus['active'] !== "1";
        } else {
            return skillConfig['active'] !== "1";
        }
    },


    /**
     * Determines whether a skill is active based on its status or configuration.
     *
     * This function is the logical inverse of `_isSkillNotActive(...)`. It checks if the skill
     * is active either by looking at the `skillConfigStatus.active` field (if available), or falling back
     * to `skillConfig.active`.
     *
     * @param {Object|null} skillConfigStatus - Optional status object from SKILL_CONFIG_STATUS table.
     *        - {String} active: "1" means active, "0" means inactive.
     * @param {Object} skillConfig - Required skill configuration object from SKILL_CONFIG table.
     *        - {String} active: "1" or "0".
     *
     * @returns {Boolean} - Returns true if the skill is considered active; false otherwise.
     *
     * @example
     * // Case 1: Status exists and shows active
     * var skillConfigStatus = { active: "1" };
     * var skillConfig = { active: "0" };
     * _isSkillActive(skillConfigStatus, skillConfig); // true
     *
     * // Case 2: Status is missing, config says active
     * var skillConfigStatus = null;
     * var skillConfig = { active: "1" };
     * _isSkillActive(skillConfigStatus, skillConfig); // true
     *
     * // Case 3: Both indicate inactive
     * var skillConfigStatus = { active: "0" };
     * var skillConfig = { active: "0" };
     * _isSkillActive(skillConfigStatus, skillConfig); // false
     */
    _isSkillActive: function(skillConfigStatus, skillConfig) {
        return !this._isSkillNotActive(skillConfigStatus, skillConfig);
    },

    _getLatestUpdateDate: function(skillConfigStatus, skillConfig) {
        return skillConfigStatus ? skillConfigStatus['skill_config_status_update_date'] : skillConfig['skill_config_update_date'];
    },


    /**
     * Extracts and filters skill applicability records based on skill activity.
     *
     * 
     * 
     * We only need to check if the skill config is active.
     *
     * This function:
     * 1. Verifies if each skill config is active using `_isSkillActive(...)`.
     * 2. Constructs structured records for active skills.
     * 3. Sorts the final list by latest update date and returns it.
     *
     * @param {Array<String>} skillConfigIds - Array of skill config sys_ids to evaluate (not used, kept for compatibility).
     * @param {Object} applicabilities - Map of applicability sys_id → applicability object with:
     *        - {String} sysId
     *        - {Object} filterParameters
     *        - {String} skillConfig
     * @param {Object} skillConfigs - Map of skill config ID → skill config object with:
     *        - {String} skill_id
     *        - {String} sys_updated_on
     *        - {String} active
     * @param {Object} skillConfigStatuses - Map of skill config ID → status object with:
     *        - {String} active
     * @param {Object} skillM2Ms - Map of skill config ID → boolean (not used, kept for compatibility).
     * @param {String} skillId - The target skill ID.
     *
     * @returns {Array<Object>} - A sorted list of applicability record info objects with fields:
     *        - {String} sysId
     *        - {Object} filterParameters
     *        - {String} skillConfig
     *        - {String} skillId
     *        - {String} latest_update_date
     *
     * @example
     * var applicabilities = {
     *   "app_001": { sysId: "app_001", filterParameters: { table: "incident" }, skillConfig: "config_001" }
     * };
     * var skillConfigs = {
     *   "config_001": { skill_id: "incident_summarizer", sys_updated_on: "2024-10-01 10:00:00", active: "1" }
     * };
     * var skillConfigStatuses = {
     *   "config_001": { active: "1" }
     * };
     * var result = _extractApplicabilities(applicabilities, skillConfigs, skillConfigStatuses, "incident_summarizer");
     */
    _extractApplicabilities: function(applicabilities, skillConfigs, skillConfigStatuses, skillId) {
        var skillConfigApplicabilityRecordsInfo = [];
        for (let applicability of Object.values(applicabilities)) {
            var skillConfigId = applicability.skillConfig;
            var skillConfig = skillConfigs[skillConfigId];
            var skillConfigStatus = skillConfigStatuses[skillConfigId];

            skillConfigApplicabilityRecordsInfo.push({
                sysId: applicability.sysId,
                filterParameters: applicability.filterParameters,
                skillConfig: skillConfigId,
                skillId: skillId,
                latest_update_date: this._getLatestUpdateDate(skillConfigStatus, skillConfig)
            });			
		}

        return this._sortApplicabilities(skillConfigApplicabilityRecordsInfo);
    },


    /**
     * Retrieves applicability records for a given skill ID, optionally scoped to a domain,
     * by combining data from skill configurations, statuses, M2M relationships, and applicability definitions.
     *
     * Utilizes caching to improve performance. If a cached result exists for the specified
     * domain and skill ID, it is returned directly. Otherwise:
     * 1. All applicability records are listed.
     * 2. Corresponding skill configuration records and statuses are fetched.
     * 3. M2M mappings between configs and the skillId are listed.
     * 4. Applicability records are filtered using `_extractApplicabilities(...)`.
     * 5. Results are cached and returned.
     *
     * @param {String} skillId - The ID of the skill for which to retrieve applicability records.
     * @param {GlideRecord} domainGr - A GlideRecord instance representing the current domain context.
     * @param {Boolean} [queryNoDomain=false] - If true, bypasses domain filtering during queries.
     *
     * @returns {Array<Object>} List of applicability records with metadata:
     *          - {String} sysId
     *          - {Object} filterParameters
     *          - {String} skillConfig
     *          - {String} skillId
     *          - {String} skill_config_update_date
     *
     * @example
     * var skillId = 'abc123skill';
     * var domainGr = new GlideRecord('sys_domain');
     * domainGr.get('global'); // Use 'global' domain for example
     *
     * var results = myScriptObject._getSkillConfigApplicabilityRecordsInfo(skillId, domainGr, false);
     * gs.info('Found applicability records: ' + JSON.stringify(results));
     */
    _getSkillConfigApplicabilityRecordsInfo: function(skillId, domainGr, queryNoDomain = false) {
        var cachedApplicabilityRecordsInfo = this.CACHE_UTIL.getNACache(this.APPLICABILITY_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), skillId);
        if (cachedApplicabilityRecordsInfo) {
            return cachedApplicabilityRecordsInfo;
        }
        try {
            var skillsConfigIds = this._getSkillConfigIdsForSkill(skillId, domainGr, queryNoDomain);
            var skillConfigStatuses = this._getSkillConfigStatuses(skillsConfigIds, domainGr, queryNoDomain);
            var activeSkillConfigIds = [];

            for (let skillConfigId of Object.keys(skillConfigStatuses)) {
                var skillConfigStatus = skillConfigStatuses[skillConfigId];
                if(this._isSkillActive(skillConfigStatus, {}))
                {
                    activeSkillConfigIds.push(skillConfigId);
                }
            }
            if (activeSkillConfigIds.length === 0) {
                return [];
            }

            var applicabilities = this._listApplicabilities(domainGr, queryNoDomain, activeSkillConfigIds);
            var skillConfigIds = Object.values(applicabilities).map(item => item.skillConfig);
            if (skillConfigIds.length == 0) {
                return [];
            }
            
            // Fetch skill configs and statuses for the filtered applicabilities
            var skillConfigs = this._getSkillConfigs(skillConfigIds, domainGr, queryNoDomain);
            var skillConfigApplicabilityRecordsInfo = this._extractApplicabilities(applicabilities, skillConfigs, skillConfigStatuses, skillId);
            // set into cache
            if (skillConfigApplicabilityRecordsInfo.length && !queryNoDomain) {
                var applicabilityRecordId = skillConfigApplicabilityRecordsInfo[0].sysId;
                this.CACHE_UTIL.setNACache(this.APPLICABILITY_CACHE_STORE, this._getDomainKeyForCacheQuery(domainGr), applicabilityRecordId, skillConfigApplicabilityRecordsInfo, skillId);
            }

            return skillConfigApplicabilityRecordsInfo;
        } catch (e) {
            gs.error('NowAssistSkillConfig: Unable to fetch skill configurations for filters : ' + e.toString());
            return [];
        }
    },


    _isSkillConfigMappedToSkill: function(skillConfig, skillId, domainGr, queryNoDomain = false) {
        var configAndSkillM2MGr = new GlideRecord(this.CONFIG_TO_SKILL_M2M);
        configAndSkillM2MGr.addQuery('skill_config', skillConfig);
        configAndSkillM2MGr.addQuery('skill_id', skillId);
        this._applyQuery(configAndSkillM2MGr, domainGr, queryNoDomain);

        return configAndSkillM2MGr.getRowCount() > 0;
    },

    _getVariables: function(glideRecord) {
        var variables = {};
        var vars = glideRecord.vars;
        for (var item in vars) {
            if (item == 'selected_headers') {
                variables[item] = NAASkillConfigUtil.getPromptHeadersData(vars[item]);
            } else {
                variables[item] = gs.nil(vars[item]) ? "" : vars[item].toString();
            }
        }
        return variables;
    },

    _getVariableOverrides: function(variableSetId, domainGr) {
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery('parent', variableSetId);
        skillConfigVarSetGr.orderBy('order');
        this._applyRecordBasedDomainQuery(skillConfigVarSetGr, domainGr);
        skillConfigVarSetGr.query();

        var overrideSet = [];
        while (skillConfigVarSetGr.next()) {
            overrideSet.push(this._getVariableSetInfo(skillConfigVarSetGr, true));
        }

        return overrideSet;
    },

    _getVariableSetInfo: function(skillConfigVarSetGr, shouldIncludeVariableOverrides) {
        var varSetUIData = NAASkillConfigVarUtil._getVarSetUIData(skillConfigVarSetGr.getUniqueValue());
        var step_details = {};
        step_details.name = skillConfigVarSetGr.getValue('name');
        step_details.title = varSetUIData['title'] || skillConfigVarSetGr.getValue('title');
        step_details.order = skillConfigVarSetGr.getValue('order');
        step_details.config_type = skillConfigVarSetGr.getValue('config_type');

        //props for skill var set
        step_details.props = this._getVariables(skillConfigVarSetGr);
        if (shouldIncludeVariableOverrides) {
            step_details.override_sets = this._getVariableOverrides(skillConfigVarSetGr.getValue('sys_id'), skillConfigVarSetGr);
        }

        return step_details;
    },

    /**
     * Checks if a set of filter parameters matches against a set of filters to be matched.
     *
     * This method compares provided filter parameters against specified filters in a systematic manner:
     *
     * - For each filter parameter key, the method checks if there is a corresponding filter in the given `filtersToMatch`.
     * - If a matching filter exists, it evaluates whether the filter parameter's value matches the filter value.
     *   - If the filter parameter's value includes the special string '^OR', the method checks if any of the options
     *     separated by '^OR' match the filter value.
     *   - If not using '^OR', the method performs an exact equality comparison.
     * - If the filter parameter key does not exist in `filtersToMatch`, it's considered a mismatch.
     * - If all filter parameters match their corresponding filters, the method returns true; otherwise, it returns false.
     *
     * @param {Object} filterParams - The set of filter parameters to be checked.
     * @param {Object} filtersToMatch - The set of filters to match against.
     * @returns {boolean} `true` if all filter parameters match their corresponding filters; otherwise, `false`.
     */
    _isMatchWithFilters: function(filterParams, filtersToMatch) {
        var self = this;

        for (var filterIdx = 0; filterIdx < filtersToMatch.length; filterIdx++) {
            var filterKeys = Object.keys(filterParams);
            var match = filterKeys.every(function(key) {
                return self._compareKeyValue(key, filterParams, filtersToMatch[filterIdx]);
            });

            if (match) {
                return true;
            }
        }

        return false;
    },

    /**
     * Checks if the provided filter parameters strictly match against any of the given array of filters.
     *
     * This method iterates through each filter in the `filtersToMatch` array and compares it to the
     * provided `filterParams`. It checks if at least one filter in the array strictly matches the parameters,
     * meaning that both the number of keys and the values should be exactly the same.
     *
     * @param {Object} filterParams - The set of filter parameters to be checked.
     * @param {Object[]} filtersToMatch - The array offilters to match against.
     * @returns {boolean} `true` if any filter in the array strictly matches the filter parameters; otherwise, `false`.
     */
    _isStrictMatchWithFilters: function(filterParams, filtersToMatch) {
        var self = this;
        var filterParameters = this._copyObjectWithExclusions(filterParams, this.NS_ADMIN_INTERNAL_FILTER_KEYS);

        for (var filterIdx = 0; filterIdx < filtersToMatch.length; filterIdx++) {
            var filter = filtersToMatch[filterIdx];
            var filterKeys = Object.keys(filterParameters);

            // Check if the number of keys in filterParameters and filter are the same
            if (filterKeys.length === Object.keys(filter).length) {
                var match = filterKeys.every(function(key) {
                    return self._compareKeyValue(key, filterParameters, filter);
                });

                if (match) {
                    return true;
                }
            }
        }

        return false;
    },

    _copyObjectWithExclusions: function(sourceObject, exclusionKeys) {
        var copiedObject = {};
        for (var key in sourceObject) {
            if (sourceObject.hasOwnProperty(key) && exclusionKeys.indexOf(key) === -1) {
                copiedObject[key] = sourceObject[key];
            }
        }
        return copiedObject;
    },

    _compareKeyValue: function(key, sourceObject, targetObject) {
        // Check if the key is in the list of internal filter keys
        if (this.NS_ADMIN_INTERNAL_FILTER_KEYS.indexOf(key) !== -1) {
            return true;
        }

        // Check if the key exists in the targetObject
        if (targetObject.hasOwnProperty(key)) {
            // Handle special comparison cases
            if (sourceObject[key].indexOf('^OR') !== -1) {
                var options = sourceObject[key].split('^OR');
                return options.indexOf(targetObject[key]) !== -1;
            } else if (sourceObject[key] === 'ISEMPTY') {
                return !targetObject[key];
            } else if (sourceObject[key] === 'ISNOTEMPTY') {
                return !!targetObject[key];
            }

            // Standard comparison
            return sourceObject[key] === targetObject[key];
        }

        // Key doesn't exist in targetObject
        return false;
    },

    /**
     * Internal method. Retrieves and returns the first skill configuration that matches the given filters.
     */
    _getSkillConfigByFilters: function(filters, strictMatch, skillConfigApplicabilityRecordsInfo, domainGr, doNotReturnFirstMatch) {
        try {
            var configs = [];
            for (var skillConfigApplicabilityRecordInfoIndex = 0; skillConfigApplicabilityRecordInfoIndex < skillConfigApplicabilityRecordsInfo.length; skillConfigApplicabilityRecordInfoIndex++) {
                var skillConfigApplicabilityRecordInfo = skillConfigApplicabilityRecordsInfo[skillConfigApplicabilityRecordInfoIndex];
                var filterParams = skillConfigApplicabilityRecordInfo.filterParameters;
                var isMatch = strictMatch ? this._isStrictMatchWithFilters(filterParams, filters) : this._isMatchWithFilters(filterParams, filters);
                if (isMatch) {
                    var config = this.getSkillConfiguration(skillConfigApplicabilityRecordInfo.skillConfig, domainGr);
                    if (!doNotReturnFirstMatch) {
                        return config;
                    }
					if(config){
						configs.push(config);
					}
                }
            }
            return doNotReturnFirstMatch ? configs : null;
        } catch (e) {
            gs.error('NowAssistSkillConfig: Unable to fetch skill configurations for filters : ' + JSON.stringify(filters) + e.toString());
        }
    },


    _getSkillConfigurationWithBaseTableFallback: function(filtersToMatch, strictMatch, isQueryForBaseTable, skillConfigApplicabilityRecordsInfo, recordGr, queryNoDomain = false) {
        try {
            if (!filtersToMatch || !filtersToMatch.length) {
                return;
            }

            var baseTableFilters = [];

            for (var i = 0; i < skillConfigApplicabilityRecordsInfo.length; i++) {
                var recordInfo = skillConfigApplicabilityRecordsInfo[i];
                var filterParams = recordInfo.filterParameters;
                var isMatch = strictMatch ? this._isStrictMatchWithFilters(filterParams, filtersToMatch) : this._isMatchWithFilters(filterParams, filtersToMatch);
                var isApplicable = !isQueryForBaseTable || !filterParams['__applicable_for_extended_tables__'] || filterParams['__applicable_for_extended_tables__'] == "true";

                if (isMatch && isApplicable) {
                    return queryNoDomain ? true : this.getSkillConfiguration(recordInfo.skillConfig, recordGr);
                }
            }

            // Fallback to base table lookup
            baseTableFilters = filtersToMatch.reduce(function(result, filter) {
                if (filter.hasOwnProperty('table')) {
                    var tableHierarchy = new GlideTableHierarchy(filter.table);
                    var baseTable = tableHierarchy.getBase();
                    if (baseTable != filter.table) {
                        var baseTableFilter = JSON.parse(JSON.stringify(filter));
                        baseTableFilter.table = baseTable;
                        result.push(baseTableFilter);
                    }
                }
                return result;
            }, []);
            return this._getSkillConfigurationWithBaseTableFallback(baseTableFilters, strictMatch, true, skillConfigApplicabilityRecordsInfo, recordGr, queryNoDomain);
        } catch (e) {
            gs.error('NowAssistSkillConfig: Unable to fetch skill configurations for filters and base table fallback: ' + JSON.stringify(filtersToMatch) + e.toString());
        }
    },

    _getAllSkillConfigurationsWithBaseTableFallback: function(filtersToMatch, strictMatch, isQueryForBaseTable, skillConfigApplicabilityRecordsInfo, recordGr) {
        try {
            if (!filtersToMatch || !filtersToMatch.length) {
                return [];
            }

            var matchingConfigurations = this._getMatchingConfigsWithApplicability(filtersToMatch, strictMatch, isQueryForBaseTable, skillConfigApplicabilityRecordsInfo, recordGr);
            
            if (matchingConfigurations.length > 0) {
                return matchingConfigurations;
            }

            var baseTableFilters = this._createBaseTableFilters(filtersToMatch);
            if (baseTableFilters.length > 0) {
                return this._getAllSkillConfigurationsWithBaseTableFallback(baseTableFilters, strictMatch, true, skillConfigApplicabilityRecordsInfo, recordGr);
            }
            
            return [];
        } catch (e) {
            gs.error('NowAssistSkillConfig: Unable to fetch all skill configurations for filters and base table fallback: ' + JSON.stringify(filtersToMatch) + e.toString());
            return [];
        }
    },

    _getMatchingConfigsWithApplicability: function(filtersToMatch, strictMatch, isQueryForBaseTable, skillConfigApplicabilityRecordsInfo, recordGr) {
        var matchingConfigIds = this._getMatchingConfigIds(filtersToMatch, strictMatch, isQueryForBaseTable, skillConfigApplicabilityRecordsInfo);
        return this.getSkillConfigurations(matchingConfigIds, recordGr);
    },

    _getMatchingConfigIds: function(filtersToMatch, strictMatch, isQueryForBaseTable, skillConfigApplicabilityRecordsInfo) {
        var matchingIds = [];
        for (var i = 0; i < skillConfigApplicabilityRecordsInfo.length; i++) {
            var recordInfo = skillConfigApplicabilityRecordsInfo[i];
            var filterParams = recordInfo.filterParameters;
            var isMatch = strictMatch ? this._isStrictMatchWithFilters(filterParams, filtersToMatch) : this._isMatchWithFilters(filterParams, filtersToMatch);
            var isApplicable = !isQueryForBaseTable || !filterParams['__applicable_for_extended_tables__'] || filterParams['__applicable_for_extended_tables__'] == "true";

            if (isMatch && isApplicable) {
                matchingIds.push(recordInfo.skillConfig);
            }
        }
        return matchingIds;
    },

    /**
     * This method retrieves the details of multiple skill configuration records along with their associated skill config variables.
     * The skill config variables can be nested to represent a hierarchical structure. The hierarchical structure of skill config
     * variables represent an override behavior. This method uses caching and batch fetching for optimal performance.
     *
     * @param {Array<String>} skillConfigIds - Array of skill configuration sys_ids (sn_nowassist_skill_config)
     * @param {GlideRecord} domainGr - (Optional) Domain GlideRecord to apply domain-based filtering. If not provided, uses current domain context.
     * 
     * @return {Array<Object>} An array of objects of type {@link SkillConfigDetails} that contains the details of each skill configuration record 
     * and their associated skill config variables. Each object includes access control information specific to the current user.
     */
    getSkillConfigurations: function(skillConfigIds, domainGr) {
        if (!skillConfigIds || skillConfigIds.length === 0) {
            return [];
        }

        var results = [];
        var uncachedIds = [];
        var cacheKey = this._getDomainKeyForCacheQuery(domainGr);

        // Check cache first for each config
        for (var i = 0; i < skillConfigIds.length; i++) {
            var configId = skillConfigIds[i];
            var cachedResult = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, cacheKey, configId);
            if (cachedResult) {
                cachedResult.has_access_to_skill = this.getSkillConfigHasAccess(configId);
                results.push(cachedResult);
            } else {
                uncachedIds.push(configId);
            }
        }

        // Batch fetch uncached configs using IN operator
        if (uncachedIds.length > 0) {
            var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
            skillConfigGr.addQuery('sys_id', 'IN', uncachedIds.join(','));
            this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
            skillConfigGr.query();

            while (skillConfigGr.next()) {
                var configInfo = this._getSkillConfigInfo(skillConfigGr, domainGr);
                var configId = skillConfigGr.getValue('sys_id');
                
                // Cache each config individually with proper key
                this.CACHE_UTIL.setNACache(this.SKILL_CONFIG_CACHE_STORE, cacheKey, configId, configInfo);
                
                // Set access control (not cached as it's user-specific)
                configInfo.has_access_to_skill = this.getSkillConfigHasAccess(configId);
                results.push(configInfo);
            }
        }

        return results;
    },


    _filterApplicableRecords: function(skillConfigApplicabilityRecordsInfo, isQueryForBaseTable) {
        if (!isQueryForBaseTable) {
            return skillConfigApplicabilityRecordsInfo;
        }
        
        return skillConfigApplicabilityRecordsInfo.filter(function(recordInfo) {
            var filterParams = recordInfo.filterParameters;
            return !filterParams['__applicable_for_extended_tables__'] || filterParams['__applicable_for_extended_tables__'] == "true";
        });
    },

    _createBaseTableFilters: function(filtersToMatch) {
        return filtersToMatch.reduce(function(result, filter) {
            if (filter.hasOwnProperty('table')) {
                var tableHierarchy = new GlideTableHierarchy(filter.table);
                var baseTable = tableHierarchy.getBase();
                if (baseTable != filter.table) {
                    var baseTableFilter = JSON.parse(JSON.stringify(filter));
                    baseTableFilter.table = baseTable;
                    result.push(baseTableFilter);
                }
            }
            return result;
        }, []);
    },

    _getSkillConfigInfo: function(skillConfigGr, domainGr) {
        var result = {};
        var skillConfigStatus = this._getSkillConfigStatusInfo(skillConfigGr.getValue('sys_id'), domainGr);
        if (skillConfigStatus) {
            result.active = skillConfigStatus.active === "1";
            result.in_product_active = skillConfigStatus.in_product_active === "1";
            result.in_product_roles = skillConfigStatus.in_product_roles;
            result.in_mobile_active = skillConfigStatus.in_mobile_active === "1";
            result.in_mobile_roles = skillConfigStatus.in_mobile_roles || "";
        } else {
            result.active = skillConfigGr.getValue('active') === "1";
            result.in_product_active = skillConfigGr.getValue('in_product_active') === "1";
            result.in_product_roles = skillConfigGr.getValue('in_product_roles');
            result.in_mobile_active = false;
            result.in_mobile_roles = "";
        }
        result.name = skillConfigGr.getValue('name');
        result.order = skillConfigGr.getValue('order');
        result.sys_updated_on = skillConfigGr.getValue('sys_updated_on');
        result.variable_sets = this.getSkillConfigurationVariables(skillConfigGr.getValue('sys_id'), true, domainGr);
        result.sys_id = skillConfigGr.getValue('sys_id');
        var napResult = this._getNowAssistPanelDetails(this._getNAPSkillApplicabilities(skillConfigGr, domainGr), domainGr);
        result.nap_active = napResult.status;
        result.nap_roles = napResult.roles;
        result.acls = this._getACLAndRoles(skillConfigGr.getUniqueValue());

        return result;
    },

    _getACLAndRoles: function(skillConfigId) {
        var aclAndRoles = NAARoleUtil.getACLsForSkillConfig(skillConfigId);
        var data = [];
        aclAndRoles?.forEach(acl => {
            data.push({
                securityAttribute: acl.securityAttribute,
                roles: acl.roles,
                id: acl.id
            });
        });
        return data;
    },

    _getSkillConfigStatusInfo: function(skillConfigId, domainGr, queryNoDomain = false) {
        var result = null;
        var skillConfigStatusGr = new GlideRecord(this.SKILL_CONFIG_STATUS);
        skillConfigStatusGr.addQuery('skill_config', skillConfigId);
        skillConfigStatusGr.setLimit(1);
        this._applyQuery(skillConfigStatusGr, domainGr, queryNoDomain);
        if (skillConfigStatusGr.next()) {
            result = {};
            result.active = skillConfigStatusGr.getValue('active');
            result.in_product_active = skillConfigStatusGr.getValue('in_product_active');
            result.in_product_roles = skillConfigStatusGr.getValue('in_product_roles');
            result.in_mobile_active = skillConfigStatusGr.getValue('in_mobile_active');
            result.in_mobile_roles = skillConfigStatusGr.getValue('in_mobile_roles');
        }
        return result;
    },

    _getCurrentDomainID: function() {
        return gs.getSession().getCurrentDomainID() || "global";
    },

    /**
     * Retrieves the Now Assist panel details for the given skill configuration.
     *
     * @param {Array} genAiSkillApplicabilityIds - The IDs of the gen ai skill applicability records.
     * @param {GlideRecord} domainGr - The GlideRecord object for the domain.
     * @returns {Object} An object containing the status and roles of the gen ai skill applicability record.
     */
    _getNowAssistPanelDetails: function(genAiSkillApplicabilityIds, domainGr) {
        var napStatusResult = {
            status: false,
            roles: ''
        };
        if (gs.nil(genAiSkillApplicabilityIds) || !gs.tableExists(this.GEN_AI_SKILL_APPLICABILITY))
            return napStatusResult;
        var genAiSkillApplicabilityGr = new GlideRecord(this.GEN_AI_SKILL_APPLICABILITY);
        genAiSkillApplicabilityGr.addQuery('sys_id', 'IN', genAiSkillApplicabilityIds);
        this._applyRecordBasedDomainQuery(genAiSkillApplicabilityGr, domainGr);
        genAiSkillApplicabilityGr.query();

        while (genAiSkillApplicabilityGr.next()) {
            if (genAiSkillApplicabilityGr.active.toString() == 'true' || genAiSkillApplicabilityGr.active.toString() === '1') {
                napStatusResult.status = true;
                napStatusResult.roles = genAiSkillApplicabilityGr.roles.toString();
                return napStatusResult;
            }
        }
        return napStatusResult;

    },


    /**
     * Retrieves the active status of the gen ai skill applicability record.
     *
     * @param {Array} genAiSkillApplicabilityIds - The IDs of the gen ai skill applicability records.
     * @param {GlideRecord} domainGr - The GlideRecord object for the domain.
     * @returns {boolean} The active status of the gen ai skill applicability record.
     */
    _getNowAssistPanelActiveStatus: function(genAiSkillApplicabilityIds, domainGr) {
        if (gs.nil(genAiSkillApplicabilityIds) || !gs.tableExists(this.GEN_AI_SKILL_APPLICABILITY))
            return false;

        var genAiSkillApplicabilityGr = new GlideRecord(this.GEN_AI_SKILL_APPLICABILITY);
        genAiSkillApplicabilityGr.addQuery('sys_id', 'IN', genAiSkillApplicabilityIds);
        this._applyRecordBasedDomainQuery(genAiSkillApplicabilityGr, domainGr);
        genAiSkillApplicabilityGr.query();

        while (genAiSkillApplicabilityGr.next()) {
            if (genAiSkillApplicabilityGr.active.toString() == 'true') {
                return true;
            }
        }
        return false;
    },

    _getNAPSkillApplicabilities: function(skillConfigGr, domainGr) {
        var configSkillM2M = new GlideRecord(this.CONFIG_TO_SKILL_M2M);
        configSkillM2M.addQuery('skill_config', skillConfigGr.getValue('sys_id'));
        this._applyRecordBasedDomainQuery(configSkillM2M, domainGr);
        configSkillM2M.query();

        var napSkillApplicabilities = [];
        while (configSkillM2M.next()) {
            var napSkillApplicability = configSkillM2M.getValue("nap_skill_applicability");
            if (napSkillApplicability !== null && napSkillApplicability !== undefined) {
                napSkillApplicabilities.push(napSkillApplicability);
            }
        }
        var skillConfigNAPApplicability = skillConfigGr.getValue('nap_skill_applicability');
        if (skillConfigNAPApplicability !== null && skillConfigNAPApplicability !== undefined) {
            napSkillApplicabilities.push(skillConfigNAPApplicability);
        }

        return napSkillApplicabilities.join(",");
    },

    /**
     * Retrieves the active skill configuration from the skill configuration hierarchy based on the provided skillConfigId.
     * 
     * @param {string} skillConfigId - The ID of the skill configuration for which to retrieve the active skill configuration.
     * @returns {string|null} The unique ID of the active skill configuration if found, or null if not found.
     */
    getActiveSkillConfigFromSkillConfigHierarchy: function(skillConfigId, domainGr) {
        var skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
        this._applyRecordBasedDomainQuery(skillConfigGr, domainGr);
        skillConfigGr.addQuery('sys_id', skillConfigId);
        skillConfigGr.query();
        if (skillConfigGr.next()) {
            // Return id if record is active.
            var skillConfigStatus = this._getSkillConfigStatusInfo(skillConfigGr.getValue('sys_id'), domainGr);
            var active = skillConfigStatus ? skillConfigStatus.active === "1" : skillConfigGr.getValue('active') === '1';

            if (active) {
                return skillConfigGr.getUniqueValue();
            }

            // Else query again in the hierarchy with the parent ID.
            var parent = skillConfigGr.getValue('parent');
            var queryParent = gs.nil(parent) ? skillConfigGr.getUniqueValue() : parent;
            var activeSkillConfigGr = new GlideRecord('sn_nowassist_skill_config');
            activeSkillConfigGr.addQuery('parent', queryParent).addOrCondition('sys_id', queryParent);
            this._applyRecordBasedDomainQuery(activeSkillConfigGr, domainGr);
            activeSkillConfigGr.query();

            while (activeSkillConfigGr.next()) {
                var parentSkillConfigStatus = this._getSkillConfigStatusInfo(activeSkillConfigGr.getUniqueValue(), domainGr);
                if (parentSkillConfigStatus ? parentSkillConfigStatus.active === "1" : activeSkillConfigGr.getValue("active") === "1") {
                    return activeSkillConfigGr.getUniqueValue();
                }
            }
        }

        return null;
    },

    getSkillPromptHeaders: function(skillConfigId) {
        return NAASkillConfigUtil.getSkillPromptHeaders(skillConfigId);
    },

    getPromptHeadersData: function(promptHeaders) {
        return NAASkillConfigUtil.getPromptHeadersData(promptHeaders);
    },

    isBUPluginInstalled: function() {
        return NAAPluginUtil.isBuPluginInstalled();
    },

    _applyRecordBasedDomainQuery: function(gr, recordGr) {
        if (!gs.nil(recordGr) && NAADomainUtil.isRecordDomainSeparationEnabled()) {
            var domainUtil = new global.NowAssistAdminGlobalScopedUtil();
            domainUtil.addRecordDomainToProcessSeparatedQuery(gr, recordGr);
        }
    },

    _applyIgnoreDomainOnGr: function(gr) {
        if (!gs.nil(gr) && NAADomainUtil.isRecordDomainSeparationEnabled()) {
            var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
            naaGlobalUtil.ignoreDomainOnGr(gr);
        }
    },

    _getDomainKeyForCacheQuery: function(domainGr) {
        // If record domain separation enabled, the domain key is the record domain.
        // If record domain separation is not enabled or domainGr is empty, the domain key would be the current session domain.
        return !gs.nil(domainGr) && NAADomainUtil.isRecordDomainSeparationEnabled() ?
            domainGr.getValue('sys_domain') :
            this.domainId;
    },

    /**
     * getTypeOfSkillConfig is goincing to return two values
     * 1. oob -> if the skill is out of the box(shipped by serviceno now)
     * 2. custom -> if the skill is built using skill builder
     */

    getTypeOfSkillConfig: function(skillConfigId) {
	var cacheKey = "SKILL_CONFIG_TYPE_" + skillConfigId;
        var result = this.CACHE_UTIL.getNACache(this.SKILL_CONFIG_CACHE_STORE, this.domainId, cacheKey);
        if(!result){
            result = NAASkillConfigUtil.getTypeOfSkillConfig(skillConfigId);
            // There are some methods which using cache with same skillConfigId as key, so to avoid breaking other functions passing cacheKey as alternateKey
            this.CACHE_UTIL.setNACache(this.SKILL_CONFIG_CACHE_STORE, this.domainId, skillConfigId, result, cacheKey);
        }
        return result;
    },

    /**
     * Returns true/false if skill configuration is matching based on specific criteria.
     *
     * This method returns true/false if skill configuration is matching without domain by following these steps:
     *
     * 1. It searches for `sn_nowassist_skill_config_applicability` records whose `skill_config.skill_id` matches the provided `skillId`.
     * 2. Among the matching records, it evaluates each `applicabilityGR.filter_parameters` to check if it
     *    is a subset/exact match of the provided `filters` object/array.
     *    -> If `strictMatch` is false and the `filter_parameters` is a subset of the any filter in `filters` array or a subset of the filters object, it's considered a match.
     *    -> If `strictMatch` is true and the `filter_parameters` is an exact key to key and key to value match of either of the filter objects in the `filters` array or with the `filters` object, it’s considered a match.
     *
     * 3. Additionally, as a specific use-case, if the provided `filters` contain a key named `table` and no matches are found for that table name, the method extends its search to the parent table.
     * 4. If a valid record is found for the base table that satisfies the filters, it checks if that applicability record is applicable
     *    for its extended tables based on the `__applicable_for_extended_tables__` filter parameter.
     *      - Only if the `__applicable_for_extended_tables__` key is declared and set to false will the record be considered in-applicable.
     *
     * @param {String} skillId - The ID of the skill.
     * @param {Object|Array} filters - A single filter object or an array of filters to match against.
     * @param {boolean} strictMatch - decides whether the comparison between filter_parameters and filter is a subset match or a strict match.
     *
     * @returns {true|false} true if skill configuration matches the criteria, or false if no match is found.
     */
    doesSkillConfigExistForRecord: function(skillId, filters, strictMatch) {
        try {
            if (gs.nil(skillId)) {
                return false;
            }

            if (strictMatch === undefined) {
                strictMatch = true;
            }
            var skillConfigApplicabilityRecordsInfo = this._getSkillConfigApplicabilityRecordsInfo(skillId, null, true);
            var filterContext = Array.isArray(filters) ? filters : [filters];
            var result = this._getSkillConfigurationWithBaseTableFallback(filterContext, strictMatch, false, skillConfigApplicabilityRecordsInfo, null, true);
            return gs.nil(result) ? false : result;
        } catch (e) {
            gs.error('doesSkillConfigExistForRecord: Unable to fetch skill configuration for filters: ' + e.toString());
            return null;
        }
    },

    /**
     * This method will create skill config status record in sn_nowassist_skill_config_status table if a specific skill config record.
     *
     *
     * @param {String} skillFamilyId - this can be either a feature or a product
     */
    createSkillConfigStatusRecords: function(skillFamilyId) {
        try {
            if (gs.nil(skillFamilyId))
                return;
            var skillFeatures = [];
            var skillFamilyGr = new GlideRecord(this.SKILL_FAMILY);
            if (skillFamilyGr.get(skillFamilyId) && !gs.nil(skillFamilyGr.getValue('type'))) {
                if (skillFamilyGr.getValue("type").toString() === "product") {
                    var skillFeatureGr = new GlideRecord(this.SKILL_FAMILY);
                    skillFeatureGr.addQuery('parent', skillFamilyId);
                    skillFeatureGr.query();
                    while (skillFeatureGr.next()) {
                        skillFeatures.push(skillFeatureGr.getUniqueValue());
                    }
                } else if (skillFamilyGr.getValue("type").toString() === "feature")
                    skillFeatures.push(skillFamilyId);
            }

            //fetch skill configs as per the skill features
            if (skillFeatures.length > 0) {
                for (var index = 0; index < skillFeatures.length; index++) {
                    var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
                    skillConfigGr.addQuery('skill_family', skillFeatures[index]);
                    skillConfigGr.query();
                    while (skillConfigGr.next()) {
                        NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigGr.getUniqueValue(), {
                            active: skillConfigGr.getValue('active') ?? "0",
                            in_product_active: skillConfigGr.getValue('in_product_active') ?? "0",
                            in_product_roles: skillConfigGr.getValue('in_product_roles')
                        });
                    }
                }
            }
        } catch (e) {
            gs.error('createSkillConfigStatusForSkillConfig: Unable to create skill configuration status for skill config: ' + e.toString());
            return;
        }
    },

    hideCustomizePromptVarset: function(skillConfigId) {
        try {
            var varsetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
            varsetGr.addQuery("skill_config", skillConfigId);
            varsetGr.addQuery("config_type.screen_id", this.CUSTOMIZE_PROMPT_SCREEN_ID);
            varsetGr.query();
            while (varsetGr.next()) {
                varsetGr.setValue("hide_step", true);
                varsetGr.update();
                var varsetUiGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET_UI);
                varsetUiGr.addQuery("var_set", varsetGr.sys_id);
                varsetUiGr.query();
                while (varsetUiGr.next()) {
                    varsetUiGr.setValue("hide_step", true);
                    varsetUiGr.update();
                }

            }
        } catch (e) {
            gs.error('hideCustomizePromptVarset: Unable to hide customize prompt for skill config: ' + e.toString());
        }
    },

    /*
    This method duplicates skillConfig and its related records. It also handles doamin separation through isDomainDifferent * param
    *
    *  @param {String} skillConfigId - skill config id of the record to be cloned
    *  @param {boolean} isDomainDifferent - Specify that the clone creation is to different domain
    *  @param {String} valuePairs - Any data that has to be overrided in skill config.
    * @returns {string} new skill config id.
    */
    duplicateSkillConfig: function(skillConfigId, isDomainDifferent, valuePairs = {}) {
        const newSkillConfigId = NAACloneUtil._duplicateSkill(skillConfigId, isDomainDifferent, valuePairs);
        if (valuePairs["edited_in_nask"]) {
            this.hideCustomizePromptVarset(newSkillConfigId);
        }
        return newSkillConfigId;
    },

    /**
     * 
     */

    getProviderConfigurations: function() {
        return NAAGenAIUtil.getProviderConfigurations();
    },

    upsertProviderConfigurationStatus: function(providerConfiguration, selectedProvider, consent, isDifferentDomain) {
        return NAAGenAIUtil.upsertProviderConfigurationStatus(providerConfiguration, selectedProvider, consent, isDifferentDomain);
    },

    /**
     * 
	 * Sample Response
	 * {
    		"c91db808c3a47110bf30c265cb40dd0e": { // For a given capability 
    			"providerId": "",
    			"providerName": "",
    			"genAiProvider":"",
    			"genAiProviderName": ""
    		},
    		"ce064fd10127a510f877ab5e150e4896": {
    			"providerId": "",
    			"providerName": "",
    			"genAiProvider":"",
    			"genAiProviderName": ""
    		}
    	}
     */
    getProvidersFromCapabilities: function(capabilityIds, defaultCapabilityDefinitionForSkillConfig = null) {
        return NAAGenAIUtil.getProvidersFromCapabilities(capabilityIds, defaultCapabilityDefinitionForSkillConfig);
    },

    /**
     * This method inserts multiple skill config applicability records
     * @param {String} skillConfigId - ID of the skill configuration
     * @param {Array} filtersArray - Array of filter parameter objects to insert
     */
    createSkillConfigApplicabilityRecords: function(skillConfigId, filtersArray) {
        try {
            if (gs.nil(skillConfigId) || !filtersArray || !filtersArray.length) {
                gs.error("NowAssistSkillConfig.createSkillConfigApplicabilityRecords: Missing required parameters for inserting multiple applicability filters");
                return;
            }

            for (var filterParameters of filtersArray) {
                if (typeof filterParameters === 'object' && filterParameters !== null) {
                    var skillConfigApplicablityGr = new GlideRecord(this.SKILL_CONFIG_APPLICABILITY);
                    skillConfigApplicablityGr.initialize();
                    skillConfigApplicablityGr.setValue("skill_config", skillConfigId);
                    skillConfigApplicablityGr.setValue("filter_parameters", JSON.stringify(filterParameters));
                    skillConfigApplicablityGr.insert();
                }
            }
        } catch (e) {
            gs.error("NowAssistSkillConfig.createSkillConfigApplicabilityRecords: Failed to insert multiple skill config applicability filters: " + e.toString());
        }
    },

    /**
     * This method deletes a skill config applicability record
     * @param {String} skillConfigId - ID of the skill configuration
     * @param {Object} filterParameter - Filter parameter object to delete
     */
    deleteSkillConfigApplicabilityRecord: function(skillConfigId, filterParameter) {
        try {
            if (gs.nil(skillConfigId) || gs.nil(filterParameter)) {
                gs.error("NowAssistSkillConfig.deleteSkillConfigApplicabilityRecord: Missing required parameters for deleting applicability record");
                return;
            }

            var skillConfigApplicabilityGr = new GlideRecord(this.SKILL_CONFIG_APPLICABILITY);
            skillConfigApplicabilityGr.addQuery('skill_config', skillConfigId);

            var filterParamStr = typeof filterParameter === 'string' ?
                filterParameter : JSON.stringify(filterParameter);

            skillConfigApplicabilityGr.addQuery('filter_parameters', filterParamStr);
            skillConfigApplicabilityGr.query();

            if (skillConfigApplicabilityGr.next()) {
                skillConfigApplicabilityGr.deleteRecord();
            } else {
                gs.error('NowAssistSkillConfig.deleteSkillConfigApplicabilityRecord: No matching record found for deletion');
            }
        } catch (e) {
            gs.error('NowAssistSkillConfig.deleteSkillConfigApplicabilityRecord: Error deleting record: ' + e.toString());
        }
    },
    
    /**
     * Inserts a record into sn_nowassist_skill_config_var_set table based on given parameters.
     * @param {Object} recordDetails - Object containing all the details for the variable set
     * keys: varSetName, skillConfigId, configTypeId, hideStep, glideVars
     */
    createSkillConfigVarSet: function(recordDetails) {
        try {
            if (!recordDetails || gs.nil(recordDetails.skillConfigId) || gs.nil(recordDetails.configTypeId)) {
                gs.error('NowAssistSkillConfig.createSkillConfigVarSet: Required parameters missing');
                return;
            }

            var varSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
            varSetGr.initialize();

            varSetGr.setValue('name', recordDetails.varSetName || 'Default Var Set');
            varSetGr.setValue('skill_config', recordDetails.skillConfigId);
            varSetGr.setValue('config_type', recordDetails.configTypeId);

            if (recordDetails.hideStep !== undefined) {
                varSetGr.setValue('hide_step', recordDetails.hideStep);
            }

            if (recordDetails.glideVars && typeof recordDetails.glideVars === 'object') {
                for (var key in recordDetails.glideVars) {
                    if (typeof recordDetails.glideVars[key] === 'object') {
                        varSetGr.vars[key] = JSON.stringify(recordDetails.glideVars[key]);
                    } else {
                        varSetGr.vars[key] = recordDetails.glideVars[key];
                    }
                }
            }

            varSetGr.insert();

        } catch (e) {
            gs.error('NowAssistSkillConfig.createSkillConfigVarSet: Error creating var set: ' + e.toString());
        }
    },

    /**
     * Updates glide vars in sn_nowassist_skill_config_var_set table with given details.
     * @param {String} skillConfigId - ID of the skill configuration
     * @param {String} varSetId - ID of the variable set to update
     * @param {Object} glideVars - Object containing glide var values to update
     */
    updateSkillConfigVarSetGlideVars: function(skillConfigId, varSetId, glideVars) {
        try {
            if (gs.nil(skillConfigId) || gs.nil(varSetId) || gs.nil(glideVars)) {
                gs.error('NowAssistSkillConfig.updateSkillConfigVarSetGlideVars: Required parameters missing');
                return;
            }

            var varSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
            varSetGr.addQuery('sys_id', varSetId);
            varSetGr.addQuery('skill_config', skillConfigId);
            varSetGr.query();

            if (varSetGr.next()) {
                for (var key in glideVars) {
                    if (glideVars.hasOwnProperty(key)) {
                        if (typeof glideVars[key] === 'object') {
                            varSetGr.vars[key] = JSON.stringify(glideVars[key]);
                        } else {
                            varSetGr.vars[key] = glideVars[key];
                        }
                    }
                }

                varSetGr.update();

            } else {
                gs.error('NowAssistSkillConfig.updateSkillConfigVarSetGlideVars: No matching var set found');
            }
        } catch (e) {
            gs.error('NowAssistSkillConfig.updateSkillConfigVarSetGlideVars: Error updating var set: ' + e.toString());
        }
    },

    /**
     * Deletes var set record by given skillConfigId and sys_id/name.
     * 
     * @param {String} skillConfigId - ID of the skill configuration
     * @param {String} [varSetId] - sys_id of the var set to delete 
     */
    deleteSkillConfigVarSet: function(skillConfigId, varSetId) {
        try {
            if (gs.nil(skillConfigId) || gs.nil(varSetId)) {
                gs.error('NowAssistSkillConfig.deleteSkillConfigVarSet: Required parameters missing');
                return;
            }

            var varSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
            varSetGr.addQuery('skill_config', skillConfigId);
            varSetGr.addQuery('sys_id', varSetId);


            varSetGr.query();

            if (varSetGr.next()) {
                varSetGr.deleteRecord();
            } else {
                gs.error('NowAssistSkillConfig.deleteSkillConfigVarSet: No matching var set found');
            }
        } catch (e) {
            gs.error('NowAssistSkillConfig.deleteSkillConfigVarSet: Error deleting var set: ' + e.toString());
        }
    },

    type: 'NowAssistSkillConfig'
};
