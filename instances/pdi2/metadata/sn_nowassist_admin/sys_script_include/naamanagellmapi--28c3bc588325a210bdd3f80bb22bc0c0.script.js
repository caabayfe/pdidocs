var NAAManageLLMAPI = {

    _processSearchInFnGroup: function(searchTerm, recordsToSkip, recordsToFetch) {
        var gr = new GlideRecord('sn_ns_provider_configuration_llm_mapping');
        gr.addEncodedQuery('provider_configuration.nameLIKE' + searchTerm + '^ORgen_ai_provider.providerLIKE' + searchTerm);
        gr.query();
        var sysIds = [];
        while (gr.next()) {
            sysIds.push(gr.getValue('provider_configuration'));
        }
        var providerConfigGr = new GlideRecord('sn_ns_provider_configuration');
        providerConfigGr.addEncodedQuery('nameLIKE' + searchTerm + '^ORsys_idIN' + sysIds.toString() + '^ORsys_idIN');
        providerConfigGr.query();
        var totalRecord = providerConfigGr.getRowCount();
        providerConfigGr.chooseWindow(recordsToSkip, recordsToFetch);
        providerConfigGr.orderBy('name');
        providerConfigGr.query();
        return {
            providerConfigGr: providerConfigGr,
            totalRecord: totalRecord
        };
    },

    _createFnGroupRowRecords: function(providerConfigGr, rowsData) {
        while (providerConfigGr.next()) {
            var result = {};
            var name = providerConfigGr.getValue('name');
            result.name = name ? name : "";
            result.sys_id = providerConfigGr.getValue('sys_id');

            var providerConfigStatusGr = new GlideRecord('sn_ns_provider_configuration_status');
            providerConfigStatusGr.addQuery('provider_configuration', providerConfigGr.getValue('sys_id'));
            providerConfigStatusGr.query();

            if (providerConfigStatusGr.next()) {
                result.llm_provider = gs.nil(providerConfigStatusGr.getDisplayValue('selected_gen_ai_provider')) ? providerConfigStatusGr.getDisplayValue('selected_provider.gen_ai_provider') : providerConfigStatusGr.getDisplayValue('selected_gen_ai_provider');
                result.last_updated_on = providerConfigStatusGr.getDisplayValue('sys_updated_on');
            }

            var scriptResult = NAAGenAIUtil._evaluateProviderConfigurationAdvancedScript(providerConfigGr);
            if (NAAGenAIUtil.isADictionary(scriptResult)) {
                result.dependent_provider_configurations = scriptResult['dependent_provider_configurations'];
            }

            var capabilityList = providerConfigGr.getValue('capability_list');
            capabilityList = capabilityList.split(",");
            var skillCapabilityMap = this.fetchAllCapabilityAndSkills("fetchAllSkillCapabiltyMapping", capabilityList);
            skillCapabilityMap = skillCapabilityMap.skillCapabilityMapping;
            result.numberOfCapabilities = Object.values(skillCapabilityMap).reduce((sum, skills) => sum + skills.length, 0);
            rowsData.rows.push(this._getFnGroupRowPayload(result));
        }
        return rowsData;
    },

    /**
     * Merges the `numberOfSkills` count from a dependent row into a target row.
     *
     * This function is used in scenarios where a parent (target) row declares a dependency
     * on one or more other rows (dependent rows). The dependent row contributes its
     * `numberOfSkills` value to the parent, and this function consolidates that value.
     *
     * It reads the `numberOfSkills.value` from both rows, adds them together, and updates
     * the target row's `numberOfSkills` object with the new total. All three properties
     * — `value`, `label`, and `id` — are updated to reflect the new count, assuming they
     * are used consistently across the data grid for sorting, display, or identification.
     *
     * This is typically used as part of a deduplication or row-merging process in data grids
     * where dependent rows are removed after their values are absorbed into their parent.
     *
     * The function gracefully handles missing or undefined skill counts by treating them as 0.
     *
     * @param {Object} targetRow - The primary row into which the dependent row's skill count will be merged.
     *                             It is expected to have a `cells.numberOfSkills` object or none at all.
     *
     * @param {Object} dependentRow - The secondary (child/dependent) row whose skill count will be added
     *                                to the target row. It should contain a `cells.numberOfSkills.value` field.
     *
     * @returns {void} - This function mutates `targetRow` in-place and returns nothing.
     */
    mergeSkillCounts: function(targetRow, dependentRow) {
        const hasSkillCells = targetRow?.cells?.numberOfSkills && dependentRow?.cells?.numberOfSkills;
        if (!hasSkillCells) {
            return;
        }
        const depSkillsCount = dependentRow.cells?.numberOfSkills?.value || 0;
        const currentSkillsCount = targetRow.cells.numberOfSkills?.value || 0;
        const newSkillsCount = currentSkillsCount + depSkillsCount;

        targetRow.cells.numberOfSkills = {
            value: newSkillsCount,
            label: newSkillsCount,
            id: newSkillsCount
        };
    },

    /**
     * Merges capability lists from a dependent row into a target row.
     * 
     * - Ensures both rows have valid capability lists (arrays).
     * - Merges the two arrays into a single deduplicated list.
     * - Updates the target row's `capability_list` with the merged values.
     * - Optionally adds a `capability_list_count` field to show total count.
     * 
     * This function is safe to call even if one or both rows are missing
     * `capability_list` fields — it will exit silently if not applicable.
     *
     * @param {Object} targetRow - The main row where capabilities should be merged into.
     * @param {Object} dependentRow - The row whose capabilities should be added.
     */
    mergeCapabilities: function(targetRow, dependentRow) {
        const hasCapabilities = Array.isArray(targetRow.capability_list) && Array.isArray(dependentRow.capability_list);
        if (!hasCapabilities) {
            return;
        }
        const targetList = targetRow.capability_list || [];
        const dependentList = dependentRow.capability_list || [];

        // Merge unique capability IDs
        const mergedSet = new Set([...targetList, ...dependentList]);
        targetRow.capability_list = Array.from(mergedSet);

        // Optional: add a new field with the count
        targetRow.capability_list_count = targetRow.capability_list.length;
    },

    /**
     * Merges all dependent rows’ skill counts into the given parent row.
     *
     * This function is responsible for processing a row that has declared one or more
     * `dependent_provider_configurations`. For each dependent row (referenced by ID),
     * it performs the following steps:
     *
     * 1. Looks up the dependent row using the `rowMap`.
     * 2. If found, calls `mergeSkillCounts()` to add its `numberOfSkills` value
     *    to the parent row.
     * 3. Removes the dependent row from `rowMap` to ensure it is excluded from final output.
     *
     * This operation is part of a data transformation pipeline that collapses related rows
     * into a single parent row, consolidating their skill counts, and removing duplicates.
     * 
     * The function assumes that the `row` object has a field named `dependent_provider_configurations`,
     * which is an array of `sys_id`s of other rows. If the list is empty or missing,
     * no action is taken.
     *
     * @param {Object} row - The parent row that declares dependencies. After this operation,
     *                       its `numberOfSkills` field will reflect the total count from
     *                       itself and its dependents.
     *
     * @param {Map<string, Object>} rowMap - A map of all rows keyed by their `id`.
     *                                       Used to efficiently locate dependent rows
     *                                       and to track which rows remain in the final result.
     *
     * @returns {void} - The function mutates both the `row` and the `rowMap` in place.
     */
    mergeDependenciesIntoRow: function(row, rowMap) {
        for (const depId of row.dependent_provider_configurations) {
            const depRow = rowMap.get(depId);
            if (depRow) {
                NAAManageLLMAPI.mergeSkillCounts(row, depRow);
                NAAManageLLMAPI.mergeCapabilities(row, depRow);
                rowMap.delete(depId);
            }
        }
    },

    /**
     * Consolidates dependent skill rows into their respective parent rows
     * and updates the dataset to reflect merged rows only.
     *
     * This function iterates over each row in the provided data structure
     * and identifies rows that declare dependencies via the
     * `dependent_provider_configurations` field.
     *
     * For each such row:
     *  - It merges skill counts from the dependent rows into the parent row
     *    using `mergeDependenciesIntoRow()`.
     *  - It removes the processed dependent rows from the internal row map.
     *  - It deletes the `dependent_provider_configurations` field from the parent row
     *    after processing, as it's no longer needed.
     *
     * The function builds a final list of rows by keeping only those entries
     * that remain in `rowMap` after merging (i.e., excluding merged/removed dependents).
     *
     * Finally, it updates the original `data` object in-place with the reduced row list
     * and corrects the `totalRecord` field accordingly.
     *
     * This method is typically used when preparing a data table for display or export,
     * where related rows must be merged and deduplicated based on their relationships.
     *
     * @param {Object} data - The complete data object containing:
     *                        - `rowPayload.rows`: the array of row entries
     *                        - `totalRecord`: total number of records (will be updated)
     *                        - other metadata fields (unchanged)
     *
     * @returns {Object} - The updated data object, with:
     *                     - Merged skill counts for parent rows
     *                     - Removed dependent rows
     *                     - Updated `totalRecord` and `rowPayload.rows`
     */
    processAndMergeRows: function(providerConfigurations) {
        const rowMap = new Map(providerConfigurations.map(row => [row.id, row]));
        const updatedRows = [];

        for (const row of providerConfigurations) {
            if (row.dependent_provider_configurations && row.dependent_provider_configurations.length > 0) {
                NAAManageLLMAPI.mergeDependenciesIntoRow(row, rowMap);
                delete row.dependent_provider_configurations;
            }
        }

        for (const row of providerConfigurations) {
            if (rowMap.has(row.id)) {
                updatedRows.push(row);
            }
        }

        return updatedRows;
    },


    mergeDependentProviderConfigurations: function(data) {
        const updatedRows = NAAManageLLMAPI.processAndMergeRows(data.rowPayload.rows);
        data.rowPayload.rows = updatedRows;
        data.totalRecord = updatedRows.length;
        return data;
    },

    fetchDataForFunctionalGroupListing: function(input) {
        try {
            var pageNumber = 0;
            var totalRecord = 0;
            var providerConfigGr;
            var pageSize = NAAConstant.MANAGE_LLM_PROVIDERS_FUNCTIONAL_GROUP_LISTING_DEFAULT_SIZE;
            var rowsData = {
                rows: []
            };
            if (input && input.page_number) {
                pageNumber = input.page_number;
            }
            var currentPageNumber = pageNumber + 1;
            var recordsToSkip = pageNumber * pageSize;
            var recordsToFetch = currentPageNumber * pageSize;
            var skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
            skillConfigGr.addEncodedQuery('skill_family.sys_id!=' + NAAConstant.OTHER_WORKFLOW_ID);
            var skillProductNameMapping = input?.payload?.fetchSkillProductMapping ? this._getSkillProductMapping(skillConfigGr) : [];
            if (input && input.search_term) {
                var searchResult = this._processSearchInFnGroup(input.search_term, recordsToSkip, recordsToFetch);
                providerConfigGr = searchResult.providerConfigGr;
                totalRecord = searchResult.totalRecord;
            } else {
                providerConfigGr = new GlideRecord('sn_ns_provider_configuration');
                providerConfigGr.query();
                totalRecord = providerConfigGr.getRowCount();
                providerConfigGr.chooseWindow(recordsToSkip, recordsToFetch);
                providerConfigGr.orderBy('name');
                providerConfigGr.query();
            }
            var result = this._formResponse(totalRecord, pageSize, providerConfigGr, rowsData, 'functionalGroup', skillProductNameMapping);
            return NAAManageLLMAPI.mergeDependentProviderConfigurations(result);
        } catch (e) {
            gs.error("Failed skills based on provider - " + e.toString());
        }
    },
    _getColumnDefinitions(type) {
        if (type == 'functionalGroup') {
            return {
                "columns": [{
                        "cellEditingDisabled": true,
                        "key": "name",
                        "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Name"),
                        "type": "string"

                    },
                    {
                        "cellEditingDisabled": true,
                        "key": "numberOfSkills",
                        "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Number of skills"),
                        "type": "string"

                    },
                    {
                        "cellEditingDisabled": true,
                        "key": "defaultLlmProviders",
                        "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Current model provider"),
                        "type": "string"
                    },
                    {
                        "cellEditingDisabled": true,
                        "key": "llmProviderLastUpdate",
                        "componentTag": "now-highlighted-value",
                        "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Model provider last updated"),
                        "type": "string"
                    }

                ]
            };
        }
        return {
            "columns": [{
                    "cellEditingDisabled": true,
                    "componentTag": "now-button-iconic",
                    "key": "status",
                    "label": "Status",
                    "type": "custom"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "oobSkillName",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Name"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "product",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Product"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "type",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Type"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "defaultLlmProviders",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Current model provider"),
                    "type": "string"
                }
            ]
        };
    },
    _getFnGroupRowPayload: function(result) {
        return {
            "key": result.name + result.sys_id,
            "cells": {
                "name": {
                    "value": result.name,
                    "label": result.name,
                    "id": result.name,

                },
                "numberOfSkills": {
                    "value": result.numberOfCapabilities,
                    "label": result.numberOfCapabilities,
                    "id": result.numberOfCapabilities,
                },
                "defaultLlmProviders": {
                    "value": result.llm_provider,
                    "label": result.llm_provider,
                    "id": result.llm_provider,
                },
                "llmProviderLastUpdate": {
                    "value": result.last_updated_on ? NAADateUtil.convertDateFormat(result.last_updated_on) : '',
                    "label": result.last_updated_on,
                    "id": result.last_updated_on,
                },

            },
            "id": result.sys_id,
            "dependent_provider_configurations": result.dependent_provider_configurations

        };
    },

    fetchSkillDataForManageProviders: function(input) {
        try {
            return NAAManageLLMAPI.fetchAllCapabilityAndSkills('skillLisitng');
        } catch (e) {
            gs.error('fetchSkillDataForManageProviders: Unable to fetch Skills data  ' + e.toString());
        }
    },

    _formatSkillDataForSkillListing(skillSuperObject, res, responseArray, skillIds) {
        var oobText = sn_i18n.Message.getMessage("sn_nowassist_admin", "OOB");
        var customText = sn_i18n.Message.getMessage("sn_nowassist_admin", "Custom");
        const otherProductText = sn_i18n.Message.getMessage("sn_nowassist_admin", "Other");
        var one_extend_data = NAAGenAIUtil.getOneExtendDefConfigData();
        var skill_config_m2m_data = NAAGenAIUtil.getSkillConfM2MData(skillIds);

        const isCustomSkill = (skill) =>
            skill.skill_family_category === 'custom' || skill.skill_family === NAAConstant.OTHER_WORKFLOW_ID;
        const getProductName = (skill) =>
            isCustomSkill(skill) ? otherProductText : skill.skill_family_parent_name;
        const getType = (skill) =>
            isCustomSkill(skill) ? customText : oobText;

        for (const skillId in skill_config_m2m_data) {
            var providerData = NAAGenAIUtil.getProvider(one_extend_data, skill_config_m2m_data, skillSuperObject[skillId], skillId);
            var skillProviderId = providerData['skillConfigGenAiProviderIds'][0];
            var skillProvideName = providerData['skillConfigLlmNames'];
            var skillStatus = skillSuperObject[skillId]['state'] == 'notconfigured' ? 'NOT_STARTED' : skillSuperObject[skillId]['state']
            responseArray.push({
                sys_id: skillId,
                skill_name: skillSuperObject[skillId]['name'],
                provider_name: skillProvideName,
                status_tooltip: NAAConstant.CONSTANTS.SKILL_STATES[skillStatus?.toUpperCase()],
                providerId: skillProviderId,
                status: skillSuperObject[skillId]['state'],
                product_name: getProductName(skillSuperObject[skillId]),
                type: getType(skillSuperObject[skillId])

            });
        }

        for (var key in skillSuperObject) {
            var skillStatusForToolTip = skillSuperObject[key]['state'] == 'notconfigured' ? 'NOT_STARTED' : skillSuperObject[key]['state'];
            var response = {};
            var skillId = skillSuperObject[key]['capabilityId'];
            if (skill_config_m2m_data[skillSuperObject[key]['id']]) {
                continue;
            }
            response.type = getType(skillSuperObject[key]);
            response.skill_name = skillSuperObject[key]['name'];
            response.provider_name = res[skillId]?.genAiProviderName;
            response.providerId = res[skillId]?.genAiProvider;
            response.sys_id = skillSuperObject[key]['id'];
            response.status_tooltip = NAAConstant.CONSTANTS.SKILL_STATES[skillStatusForToolTip?.toUpperCase()];
            response.status = skillSuperObject[key]['state'];
            response.capabilityId = skillId;
            response.product_name = getProductName(skillSuperObject[key]);
            response.product_id = skillSuperObject[key]['product_id'];
            response.workflow_id = skillSuperObject[key]['workflow_id'];
            responseArray.push(response);
        }

        return responseArray;

    },

    _getSkillStatus(skillConfigState, skillConfigId) {
        var skillConfigStatusGr = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
        skillConfigStatusGr.addQuery('skill_config', skillConfigId);
        skillConfigStatusGr.query();
        if (skillConfigStatusGr.next()) {
            skillConfigState = skillConfigStatusGr.getValue('active');
        }

        return this._mapSkillStatus(skillConfigState, skillConfigId);
    },
    _getStatusColor: function(status) {
        const statusColors = {
            ACTIVE: "rgb(var(--now-color_alert--positive-2))",
            INACTIVE: "rgb(var(--now-color_alert--critical-3))",
            DRAFT: "rgb(var(--now-color_alert--warning-3))"
        };
        return statusColors[status] || "rgb(var(--now-color--neutral-5))"
    },
    _getSkillListingRowPayload: function(result) {

        var rowPayload = {
            "key": result.sys_id,
            "cells": {
                "status": {
                    "componentProps": {
                        "bare": true,
                        "hidePadding": false,
                        "size": "md",
                        "tooltipContent": result.status_tooltip,
                        "style": {
                            "background": this._getStatusColor(result.status),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }
                },
                "oobSkillName": {
                    "value": result.skill_name,
                    "label": result.skill_name,
                    "id": result.sys_id

                },
                "product": {
                    "value": result.product,
                    "label": result.product,
                    "id": result.sys_id
                },
                "type": {
                    "value": result.type,
                    "label": result.type,
                    "id": result.sys_id
                },
                "defaultLlmProviders": {
                    "value": result.provider_name,
                    "label": result.provider_name,
                    "id": result.sys_id
                }
            }

        };
        return rowPayload;
    },

    _getSkillName: function(overridenSkillsAndName, skillConfigGr) {
        if (overridenSkillsAndName && overridenSkillsAndName.overridedSkillIds && overridenSkillsAndName.overridedSkillIds.indexOf(skillConfigGr.getValue('sys_id')) > -1) {
            return overridenSkillsAndName.overridenSkillsAndName[skillConfigGr.getValue('sys_id')];
        } else {
            return skillConfigGr.getDisplayValue('name');
        }
    },
    _getSkillsByProductName: function(skillProductNameMapping, searchTerm) {
        try {
            var skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
            var skillFamilySysIds = [];
            skillConfigGr.query();
            while (skillConfigGr.next()) {
                if (skillProductNameMapping) {
                    var cachedProductName = skillProductNameMapping[skillConfigGr.getValue('sys_id')] || '';
                    if (cachedProductName && cachedProductName.length > 0) {
                        if ((searchTerm && cachedProductName.toLowerCase().includes(searchTerm.toLowerCase()))) {
                            skillFamilySysIds.push(skillConfigGr.getValue('sys_id'));
                        }
                    }
                }
            }
            return skillFamilySysIds;
        } catch (e) {
            gs.error("Failed in _getSkillsByProductName - " + e.toString());
        }

    },

    _fetchUIOverridenSkillIdAndName: function(searchTerm) {
        var result = {};
        var overridenSkillsAndName = {};
        var overridedSkillIds = [];
        var skillConfigUiGr = new GlideRecord('sn_ns_skill_config_ui');
        if (searchTerm) {
            skillConfigUiGr.addEncodedQuery('nameLIKE' + searchTerm);
        }
        skillConfigUiGr.query();
        while (skillConfigUiGr.next()) {
            overridenSkillsAndName[skillConfigUiGr.getValue('skill_config')] = skillConfigUiGr.getValue('name');
            overridedSkillIds.push(skillConfigUiGr.getValue('skill_config'));
        }
        result.overridenSkillsAndName = overridenSkillsAndName;
        result.overridedSkillIds = overridedSkillIds;
        return result;

    },

    _formResponse: function(totalRecord, pageSize, providerConfigGr, rowsData, type, skillProductNameMapping) {
        return {
            columnDefinitions: this._getColumnDefinitions(type),
            rowPayload: type == 'skill_data' ? rowsData : this._createFnGroupRowRecords(providerConfigGr, rowsData),
            totalRecord: totalRecord,
            pageSize: pageSize,
            skillProductNameMapping: skillProductNameMapping
        };
    },
    _getSkillProductMapping: function(skillConfigGr) {
        var skillProductNameMapping;
        var skillbuilderNaaUtil = new sn_nowassist_admin.SkillBuilderNaaUtils();
        var skillProductCacheData = {};
        skillConfigGr.query();
        while (skillConfigGr.next()) {
            var product = skillbuilderNaaUtil.getSkillFamilyName(skillConfigGr.getValue('skill_family'), "product");
            if (!product) {
                product = skillbuilderNaaUtil.getSkillFamilyName(skillConfigGr.getValue('skill_family'), "workflow");
            }
            skillProductCacheData[skillConfigGr.getValue('sys_id')] = product;
        }
        skillProductNameMapping = skillProductCacheData;
        return skillProductNameMapping;

    },

    _updateQueryForSkillSearch: function(skillConfigGr, skillProductNameMapping, searchTerm, overridenSkillsAndName, matchingSysIds) {
        skillConfigGr.addEncodedQuery('nameLIKE' + searchTerm + '^ORsys_idIN' + matchingSysIds.toString() + '^ORsys_idIN' + overridenSkillsAndName.overridedSkillIds.toString());
        return skillConfigGr;
    },

    /**
     * Fetches and formats functional group provider data using Now Assist skill configurations.
     *
     * This method retrieves provider configurations from the `NowAssistSkillConfig` utility,
     * then processes each configuration to generate a mapping of functional groups and their associated
     * capability skills.
     *
     * @param {Object} input - An input object (currently unused but included for extensibility).
     *
     * @returns {Object} An object containing the `fnGroupProviderMappingData` key, which holds
     *                   an array of formatted functional group provider mappings.
     * @method fetchFunctionalGroupProviderData
     */
    fetchFunctionalGroupProviderData: function(input) {
        var result = [];
        const naUtil = new sn_nowassist_admin.NowAssistSkillConfig();

        const providerConfiguration = naUtil.getProviderConfigurations();
        if (!Array.isArray(providerConfiguration) || providerConfiguration.length === 0) {
            return {
                fnGroupProviderMappingData: result
            };
        }

        var allowedProviders = this.getAllowedProviders()?.providers;
        providerConfiguration.forEach((item) => {
            const functionalGroupData = {};
            this._formatFunctionalGroupProviderData(functionalGroupData, item, allowedProviders);
            result.push(functionalGroupData);
        });

        result = NAAManageLLMAPI.processAndMergeRows(result);

        return {
            fnGroupProviderMappingData: result
        };
    },
    /**
     * Retrieves capability skills associated with a provider configuration item.
     *
     * This method takes a provider configuration item (which includes a list of capability IDs),
     * queries the `sn_nowassist_skill_config` table using a GlideRecord, and maps each result
     * into a structured object that includes metadata and provider information.
     *
     * @param {Object} item - The provider configuration object. Must contain a `capability_list` property (comma-separated).
     * @param {GlideRecord} skillConfigGr - An initialized `GlideRecord` instance for the `sn_nowassist_skill_config` table.
     *
     * @returns {Array<Object>} An array of objects where each object contains the `skillId` as a key,
     *                          and its value is an object with metadata about the skill.
     *
     * Each returned skill object contains:
     * - `currentProvider`: The current provider for the skill, determined via `NAAGenAIUtil.getProviderForSkillConfig()`.
     * - `skill_id`: The sys_id of the skill record.
     * - `skill_name`: The name of the skill.
     * - `skill_status`: A mapped representation of the skill's state.
     * - `capabilityId`: The capability ID from the skill record.
     *
     * @method _getCapabilitiesSkills
     */

    _getCapabilitiesSkills: function(item, skillConfigGr) {
        const capabilitySkills = [];

        if (!item.capability_list || item.capability_list.length === 0)
            return capabilitySkills;

        const capabilityList = item.capability_list.toString().split(",");
        skillConfigGr.initialize();
        skillConfigGr.addQuery('skill_id', capabilityList);
        skillConfigGr.query();
        var oobText = sn_i18n.Message.getMessage("sn_nowassist_admin", "OOB");
        var customText = sn_i18n.Message.getMessage("sn_nowassist_admin", "Custom");

        while (skillConfigGr.next()) {
            const skillId = skillConfigGr.getValue('sys_id');
            capabilitySkills.push({

                currentProvider: new NAAGenAIUtil.getProviderForSkillConfig(skillId).skillConfigLlmNames,
                id: skillId,
                label: skillConfigGr.getValue('name'),
                skill_status: this._mapSkillStatus(skillConfigGr.getValue('state'), skillConfigGr.getValue('sys_id')),
                capabilityId: skillConfigGr.getValue('skill_id'),
                type: (skillConfigGr.skill_family.category?.toString() == 'custom' || skillConfigGr.skill_family == NAAConstant.OTHER_WORKFLOW_ID) ? customText : oobText


            });
        }

        return capabilitySkills;
    },

    _mapSkillStatus: function(state, skillConfigSysId) {
        if (state === "1") {
            return 'ACTIVE';
        }
        var status = "NOT_STARTED";
        var gsStatus = NAAGuidedSetupUtil._getLatestGuidedSetUpStatus(skillConfigSysId);
        if (gsStatus !== "") {
            status = gsStatus === "1" ? 'DRAFT' : 'INACTIVE';
        }
        return status;
    },


    _formatFunctionalGroupProviderData: function(functionalGroupData, item, allowedProviders) {
        functionalGroupData.id = item.sys_id;
        functionalGroupData.sys_id = item.sys_id;
        functionalGroupData.name = item.name;
        functionalGroupData.description = item?.description || "";
        functionalGroupData.upstream_routing = item.upstream_routing;
        functionalGroupData.capability_list = item.capability_list;
        functionalGroupData.dependent_provider_configurations = item.dependent_provider_configurations;
        item.providers = allowedProviders;
        functionalGroupData.selected_provider = item.selected_provider;
        functionalGroupData.global_consent = item.global_consent;
        functionalGroupData.providers = item.providers;
        functionalGroupData.source = item.source;
        return functionalGroupData;
    },

    getSkillDataForCapabilities: function(capabilitySysIds) {
        const skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
        return this._getCapabilitiesSkills({
            'capability_list': capabilitySysIds
        }, skillConfigGr)
    },
    fetchAllCapabilityAndSkills: function(type = 'fetchAllSkillCapabiltyMapping', capabilityId = []) {
        var featureId = '';
        var skillSuperObject = NAASkillConfigUtil.getSkillSuperObject(featureId, {
            fetchNAPSkillApplicabilities: false,
            fetchSkillVarsets: false,
            fetchGenAISkillApplicability: false,
            fetchChatExperience: false
        });
        if(!capabilityId.length) {
            var capabilityGr = new GlideRecord('sys_one_extend_capability');
            capabilityGr.query();
            while (capabilityGr.next()) {
                if (capabilityId.indexOf(capabilityGr.getUniqueValue()) === -1) {
                    capabilityId.push(capabilityGr.getUniqueValue());
                }
            }
        }
        var res = new NAAGenAIUtil.getProvidersFromCapabilities(capabilityId);
        var responseArray = {};
        var skillIds = [];
        for (var skill in skillSuperObject) {
            if (skillSuperObject.hasOwnProperty(skill)) {
                skillIds.push(skillSuperObject[skill]['id']);
            }
        }
        if (type == 'skillLisitng') {
            return this._formatSkillDataForSkillListing(skillSuperObject, res, [], skillIds);
        }
        this._buildSkillCapabilityMapping(skillSuperObject, res, responseArray, skillIds, capabilityId);

        return {
            "skillCapabilityMapping": responseArray,
            "type": "all_skill_capabilities",
            "aictProvider": this.getAllowedProviders(),
            "errorMessages": {
                "ER000": sn_i18n.Message.getMessage("sn_nowassist_admin", "Invalid input"),
                "ER001": sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill isn't supported by the provider"),
                "ER002": sn_i18n.Message.getMessage("sn_nowassist_admin", "Multiple provider configurations found"),
                "ER003": sn_i18n.Message.getMessage("sn_nowassist_admin", "No provider configuration found"),
                "ER004": sn_i18n.Message.getMessage("sn_nowassist_admin", "Multiple active definition configs with the same API were found"),
                "ER005": sn_i18n.Message.getMessage("sn_nowassist_admin", "No active definition config found."),
                "ER006": sn_i18n.Message.getMessage("sn_nowassist_admin", "Unexpected error occurred"),
                "ER999": sn_i18n.Message.getMessage("sn_nowassist_admin", "Unexpected error occurred")
            },
            "mimirDefaultProvider": this.getMimirDefaultProvider()
        };
    },
    getAllowedProviders: function() {
        try {
            var providers = [];
            var data = sn_one_extend.GenerativeAIUtility.getAllowedProviders();
            var providersByRouting = {};
            if (data?.providersByRouting) {
                providersByRouting = data?.providersByRouting;
            }
            var providerKey = data?.useDefault || 'regional';
            if (!providersByRouting[providerKey]) {
                providerKey = "global";
            }

            providersByRouting[providerKey]?.forEach((item) => {
                providers.push({
                    'id': item.providerId,
                    'label': item.providerName
                });
            });

            return {
                'fallback': data?.fallback,
                'providers': providers,
                'routing': data?.useDefault || 'regional'
            };
        } catch (e) {
            gs.error("Failed in fetching provider getAllowedProviders - " + e.toString());
        }

    },

    /**
     * Retrieves a list of supported LLM providers and marks which ones are allowed based on routing configuration.
     *
     * This function combines two sources:
     * - `supported_providers`: all providers supported by the platform
     * - `allowed_providers`: subset of providers allowed based on routing
     *
     * It uses the `useDefault` key (present at the root of `allowed_providers`) to extract
     * provider lists under that routing key and returns a unified list where each provider includes
     * a boolean `allowed` flag.
     *
     * The function handles null/undefined edge cases gracefully:
     * - If supported providers are missing, it defaults to an empty list
     * - If allowed providers are missing, the `allowed` flag defaults to `false` for all supported ones
     *
     * ### Example return structure:
     * ```
     * {
     *   fallback: "defaultRouting",
     *   routing: "defaultRouting",
     *   providers: [
     *     { id: "5615...", label: "Now LLM Service", allowed: true },
     *     { id: "5275...", label: "Azure OpenAI", allowed: false }
     *   ]
     * }
     * ```
     *
     * ### Data Assumptions:
     * - allowed_providers:
     *   {
     *     useDefault: "defaultRouting",
     *     fallback: "fallbackRouting",
     *     providersByRouting: {
     *       defaultRouting: [ { providerId, providerName }, ... ]
     *     }
     *   }
     *
     * - supported_providers:
     *   {
     *     providersByRouting: {
     *       defaultRouting: [ { providerId, providerName }, ... ]
     *     }
     *   }
     *
     * @returns {{
     *   fallback: string|null,
     *   routing: string|null,
     *   providers: Array<{id: string, label: string, allowed: boolean}>
     * } | undefined} Returns structured provider info or undefined on error.
     */
    getAllowedAndNotAllowedProviders: function() {
        try {
            var allowed_providers = sn_one_extend.GenerativeAIUtility.getAllowedProviders();
            var supported_providers = sn_one_extend.GenerativeAIUtility.getSupportedProviders();
            var useDefault = allowed_providers?.useDefault;
            if (!useDefault) {
                useDefault = supported_providers?.providersByRouting?.["regional"] ? "regional" : "global";
            }
            var allProviders = supported_providers?.providersByRouting?.[useDefault]?.map(provider => ({
                id: provider.providerId,
                label: provider.providerName
            }));
            var allowed_providers_list = allowed_providers?.providersByRouting?.[useDefault];
            supported_providers = supported_providers?.providersByRouting?.[useDefault];
            supported_providers = supported_providers ? supported_providers : [];
            const allowedProviderIds = allowed_providers_list ? new Set(allowed_providers_list.map(p => p.providerId)) : new Set([]);
            const providers = supported_providers.map(item => ({
                id: item.providerId,
                label: item.providerName,
                allowed: allowedProviderIds.has(item.providerId),
                style: allowedProviderIds.has(item.providerId) ? "" : '{"opacity": "0.3"}',
                image_path: NAAConstant.GEN_AI_PROVIDER_IMAGE[item.providerId]
            }));

            useDefault = NAAStringUtil.capitalize(useDefault || 'regional');
            return {
                fallback: allowed_providers?.fallback,
                providers: providers,
                routing: useDefault,
                allProviders: allProviders,
            };
        } catch (e) {
            gs.error("Failed in fetching provider getAllowedAndNotAllowedProviders - " + e.toString());
        }
    },



    isCustomType: function(skill) {
        return (skill.skill_family_category === 'custom' || skill.skill_family === NAAConstant.OTHER_WORKFLOW_ID);
    },

    _shouldIncludeCapability: function(capabilityId, isValidCapability, filteredCapabilities) {
        return isValidCapability(capabilityId) && (filteredCapabilities.length === 0 || filteredCapabilities.includes(capabilityId));
    },

    _buildSkillCapabilityMapping: function(skillSuperObject, res, responseArray, skillIds, filteredCapabilities = []) {
        const oobText = sn_i18n.Message.getMessage("sn_nowassist_admin", "OOB");
        const customText = sn_i18n.Message.getMessage("sn_nowassist_admin", "Custom");
        const otherProductText = sn_i18n.Message.getMessage("sn_nowassist_admin", "Other");
        var {
            capabilityAndDefinitionMap,
            generativeAiDefinitionsMap
        } = NAASkillConfigUtil.getCapabilityAndDefinitionsMap();

        const one_extend_data = NAAGenAIUtil.getOneExtendDefConfigData();
        const skill_config_m2m_data = NAAGenAIUtil.getSkillConfM2MData(skillIds);

        const isValidCapability = (capabilityId) => {
            const definition = capabilityAndDefinitionMap[capabilityId];
            const hasLLMDefinition = definition && generativeAiDefinitionsMap[definition[0]];
            const hasExtendData = one_extend_data[capabilityId];
            const isNonLLMSkill = !hasLLMDefinition;

            return hasExtendData && !isNonLLMSkill;
        };



        const getProductName = (skill) =>
            this.isCustomType(skill) ? otherProductText : skill.skill_family_parent_name;
        const getType = (skill) =>
            this.isCustomType(skill) ? customText : oobText;

        const addResponse = (capabilityId, response) => {
            if (!responseArray[capabilityId]) {
                responseArray[capabilityId] = [];
            }
            responseArray[capabilityId].push(response);
        };

        const buildSkillResponse = (skill, providerName, providerId, capabilityId) => ({
            id: skill.id,
            label: skill.name,
            default_provider: providerName,
            providerId: providerId,
            skill_status: skill.state,
            capabilityId: capabilityId,
            product_name: getProductName(skill),
            type: getType(skill),
            product_id: skill.product_id,
            workflow_id: skill.workflow_id
        });

        //  Skills with M2M  mappings
        for (const skillId in skill_config_m2m_data) {
            const skill = skillSuperObject[skillId];
            const providerData = NAAGenAIUtil.getProvider(one_extend_data, skill_config_m2m_data, skill, skillId);
            const skillProviderId = providerData.skillConfigGenAiProviderIds?.[0];
            const skillProvideName = providerData.skillConfigLlmNames;

            skill_config_m2m_data[skillId]?.forEach(capabilityId => {
                if (!this._shouldIncludeCapability(capabilityId, isValidCapability, filteredCapabilities)) return;
                responseArray[capabilityId] = [buildSkillResponse(skill, skillProvideName, skillProviderId, capabilityId)];
            });
        }

        //  Skills without M2M mappings
        for (const key in skillSuperObject) {
            const skill = skillSuperObject[key];
            const capabilityId = skill.skill_id;

            if (!this._shouldIncludeCapability(capabilityId, isValidCapability, filteredCapabilities)) continue;

            const response = {
                id: skill.id,
                label: skill.name,
                default_provider: res[capabilityId]?.genAiProviderName,
                providerId: res[capabilityId]?.genAiProvider,
                skill_status: skill.state,
                capabilityId: capabilityId,
                product_name: getProductName(skill),
                product_id: skill.product_id,
                workflow_id: skill.workflow_id,
                type: getType(skill)
            };

            addResponse(capabilityId, response);
        }

        return responseArray;
    },

    getManagedIntegrationData: function() {
        var gr = new GlideRecord(NAAConstant.MANAGED_INTEGRATION);
        var res = [];

        var allowed_providers = NAAManageLLMAPI.getAllowedProviders().providers;
        var allowed_providers_ids = allowed_providers.map(provider => provider.id);
        gr.addQuery('sys_id', 'IN', allowed_providers_ids);

        gr.query();
        while (gr.next()) {
            res.push({
                providerId: gr.getValue('sys_id'),
                providerName: gr.getDisplayValue('gen_ai_provider'),
                managedIntegration: gr.getValue('managed_integration'),
                integrationType: gr.getValue('integration_type')

            });
        }
        return res;

    },
    updateManagedIntegrationData: function(data) {
        try {
            var globalUtil = new global.GAICGlobalUtil();
            var gr = new GlideRecord(NAAConstant.MANAGED_INTEGRATION);
            gr.addActiveQuery();
            gr.addQuery('sys_id', 'IN', Object.keys(data));
            gr.query();
            while (gr.next()) {
                globalUtil.updateRecordForNSAdmin(NAAConstant.MANAGED_INTEGRATION, gr.sys_id, {
                    'integration_type': data[gr.getValue('sys_id')]
                });
            }

        } catch (e) {
            gs.error("NAAManageLLMAPI: Failed to update managed integration - " + e);
        }
    },
    getMimirDefaultProvider: function() {
        try {
            var mimirDefaultProviderName = '';
            var mimirDefaultProviderSysID = new global.GenAIProviderUtil().getMimirProvider();
            var response = new global.NowAssistAdminGlobalScopedUtil().getRecord(NAAConstant.GEN_AI_PROVIDER, mimirDefaultProviderSysID, [NAAConstant.GEN_AI_PROVIDER_COLUMN_NAME]);
            mimirDefaultProviderName = response?.__display_name;
            return mimirDefaultProviderName;

        } catch (e) {
            gs.error("NAAManageLLMAPI: Failed to get Mimir default provider - " + e);
        }
    },
    hasInstanceLevelProviderUpdate: function() {
        var gr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
        gr.addQuery('scope', NAAConstant.MANAGE_LLM_CHANGE_HISTORY.SCOPE.INSTANCE);
        gr.query();
        return gr.getRowCount() > 0 ;
    }


};
