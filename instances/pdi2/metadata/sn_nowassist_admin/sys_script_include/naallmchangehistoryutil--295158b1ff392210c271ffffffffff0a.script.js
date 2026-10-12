var NAALlmChangeHistoryUtil = {
    // Helper function to get column cell in presentational list
    _getPresentationalListColumns: function(columnsData) {
        var columns = columnsData.map(([key, label, type, componentTag = ""]) => {
            var cell = {
                cellEditingDisabled: true,
                key: key,
                label: label,
                type: type
            };
            if (componentTag !== "") {
                cell.componentTag = componentTag;
            }
            return cell;
        });
        return {
            columns: columns
        };
    },

    // Helper function to get columnDefinitions of Skill Change data in presentational list
    _getSkillColumnDefinitions: function() {
        var columnsData = [
            ["skillName", sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill Name"), "string"],
            ["product", sn_i18n.Message.getMessage("sn_nowassist_admin", "Product"), "string"],
            ["scope", sn_i18n.Message.getMessage("sn_nowassist_admin", "Scope"), "string"],
            ["modelProvider", sn_i18n.Message.getMessage("sn_nowassist_admin", "Model provider"), "custom", "now-rich-text"],
            ["updatedOn", sn_i18n.Message.getMessage("sn_nowassist_admin", "Updated on"), "string"],
            ["updatedBy", sn_i18n.Message.getMessage("sn_nowassist_admin", "Updated by"), "string"],
            ["status", sn_i18n.Message.getMessage("sn_nowassist_admin", "Status"), "custom", "now-button-iconic"]
        ];

        return NAALlmChangeHistoryUtil._getPresentationalListColumns(columnsData);
    },

    // Helper function to get Model Provider Cell details of Skill Change data in presentational list
    _getModelProviderCell: function(row, updateFailed) {
        return {
            "componentProps": {
                "html": updateFailed ? row.previousProvider : sn_i18n.Message.getMessage("sn_nowassist_admin", "{modelProvider} <small><b> Was </b><s>{previousProvider}</s></small>", {
                    modelProvider: row.modelProvider,
                    previousProvider: row.previousProvider
                }),
                "label": row.modelProvider,
                "id": row.modelProvider,
            }
        };
    },
    // Helper function that holds messages for status codes to be shown in the UI.
    _getStatusCodeLabels: function(statusCode) {
        var statusCodeMap = {
            "ER000": sn_i18n.Message.getMessage("sn_nowassist_admin", "Invalid input error."),
            "ER001": sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill is not supported by the provider."),
            "ER002": sn_i18n.Message.getMessage("sn_nowassist_admin", "Multiple provider configurations found."),
            "ER003": sn_i18n.Message.getMessage("sn_nowassist_admin", "No provider configuration found."),
            "ER004": sn_i18n.Message.getMessage("sn_nowassist_admin", "Multiple active definition configs with the same API were found."),
            "ER005": sn_i18n.Message.getMessage("sn_nowassist_admin", "No active definition config found."),
            "ER006": sn_i18n.Message.getMessage("sn_nowassist_admin", "Unexpected error occurred."),
            "ER999": sn_i18n.Message.getMessage("sn_nowassist_admin", "Unexpected error occurred."),
            "OK001": sn_i18n.Message.getMessage("sn_nowassist_admin", "Success")
        };
        return statusCodeMap.hasOwnProperty(statusCode) ? statusCodeMap[statusCode] : statusCode;
    },

    // Helper function to get Status Cell details of Skill Change data in presentational list
    _getStatusCell: function(row, updateFailed) {
        return {
            "componentProps": {
                "size": "md",
                "bare": true,
                "hidePadding": false,
                "tooltipContent": NAALlmChangeHistoryUtil._getStatusCodeLabels(row.statusCode),
                "style": {
                    "background": updateFailed ? "red" : "green",
                    "height": "17px",
                    "width": "17px",
                    "border-radius": "17px",
                    "margin-left": "17px"
                }
            }
        };
    },

    // Helper function to get row Skill Change data in presentational list
    _getSkillRowData: function(row) {
        var updateFailed = row.statusCode !== NAAConstant.MANAGE_LLM_CHANGE_HISTORY.SWITCH_SUCCESS_CODE;
        return {
            key: row.sys_id,
            cells: {
                skillName: {
                    value: row.skillName,
                    label: row.skillName,
                    id: row.skillName
                },
                product: {
                    value: row.product,
                    label: row.product,
                    id: row.product
                },
                scope: {
                    value: row.scope,
                    label: row.scope,
                    id: row.scope
                },
                modelProvider: NAALlmChangeHistoryUtil._getModelProviderCell(row, updateFailed),
                updatedOn: {
                    value: row.updatedOn,
                    label: row.updatedOn,
                    id: row.updatedOn
                },
                updatedBy: {
                    value: row.updatedBy,
                    label: row.updatedBy,
                    id: row.updatedBy
                },
                status: NAALlmChangeHistoryUtil._getStatusCell(row, updateFailed)
            }
        };
    },

    /*
     * Converts Skill Update result into presentational list format
     */
    _getSkillDataInPresentationalListFormat: function(result, totalRecords) {
        try {
            const rowsData = {
                "customCellEmittedActions": [],
                rows: result.map(NAALlmChangeHistoryUtil._getSkillRowData)
            };

            return {
                columnDefinitions: NAALlmChangeHistoryUtil._getSkillColumnDefinitions(),
                rowPayload: rowsData,
                totalRecords: totalRecords
            };
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil._getSkillDataInPresentationalListFormat: " + error.toString());
            return {};
        }
    },

    // Helper function to get columnDefinitions of Policy Change data in presentational list
    _getPolicyColumnDefinitions: function() {

        var columnsData = [
            ["activityDetails", sn_i18n.Message.getMessage("sn_nowassist_admin", "Activity details"), "string"],
            ["updatedOn", sn_i18n.Message.getMessage("sn_nowassist_admin", "Updated on"), "string"],
            ["updatedBy", sn_i18n.Message.getMessage("sn_nowassist_admin", "Updated by"), "string"],
            ["action", sn_i18n.Message.getMessage("sn_nowassist_admin", "Action"), "custom", "now-button"]
        ];
        return NAALlmChangeHistoryUtil._getPresentationalListColumns(columnsData);
    },

    // Helper function to get row Skill Change data in presentational list
    _getPolicyRowData: function(row) {
        return {
            "key": row.sys_id,
            "cells": {
                "activityDetails": {
                    "value": row.activityDetails,
                    "label": row.activityDetails,
                    "id": row.activityDetails,
                },
                "updatedOn": {
                    "value": row.updatedOn,
                    "label": row.updatedOn,
                    "id": row.updatedOn,
                },
                "updatedBy": {
                    "value": row.updatedBy,
                    "label": row.updatedBy,
                    "id": row.updatedBy,
                },
                "action": {
                    "componentProps": {
                        "variant": "tertiary",
                        "disabled": false,
                        "size": "sm",
                        "id": row,
                        "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "View details"),
                        "configAria": {
                            "aria-label": sn_i18n.Message.getMessage("sn_nowassist_admin", "View details"),
                        },
                        "tooltipContent": sn_i18n.Message.getMessage("sn_nowassist_admin", "View details"),
                    }
                }
            }
        };

    },

    /**
     * Retrieves paginated policy update history records from the LLM change history table. and converts to presentational list format
     *
     * @param {String} searchTerm - Text to search in the activity details and sys_updated_by fields.
     * @param {Number} pageNumber - Current page number for pagination.
     * @param {Number} recordsPerPage - Number of records to return per page.
     * @param {String} domain - Domain filter for the query. Defaults to 'global'.
     *
     * @returns {Array<Object>} - A list of matching policy history records.
     */
    getPolicyDataInPresentationalListFormat: function(searchTerm, pageNumber, recordsPerPage, domain = "global") {
        try {
            var policyData = NAALlmChangeHistoryUtil.getPolicyUpdateData(searchTerm, pageNumber, recordsPerPage, domain);
            var rowsData = {
                "customCellEmittedActions": ["NOW_BUTTON#CLICKED"],
                "selectionEnabled": false,
                rows: []
            };
            for (let row of policyData?.result) {
                rowsData.rows.push(NAALlmChangeHistoryUtil._getPolicyRowData(row));
            }
            return {
                columnDefinitions: NAALlmChangeHistoryUtil._getPolicyColumnDefinitions(),
                rowPayload: rowsData,
                totalRecords: policyData?.totalRecords
            };
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.getPolicyDataInPresentationalListFormat: " + error.toString());
            return {};
        }
    },

    // Function to get list of allowed Provider Items
    _getProviderItems: function(allowedProviders = []) {

        var providers = NAAManageLLMAPI.getAllowedAndNotAllowedProviders()?.providers;

        var supportedProviders = providers?.map(function(provider) {
            var isAllowed = allowedProviders?.includes(provider.id);
            return {
                id: provider.id,
                label: provider.label,
                allowed: isAllowed,
                style: isAllowed ? "" : '{"opacity": "0.3"}',
                image_path: NAAConstant.GEN_AI_PROVIDER_IMAGE[provider.id]
            };
        });

        return supportedProviders;
    },

    /**
     * Retrieves paginated policy update history records from the LLM change history table.
     *
     * @param {String} searchTerm - Text to search in the activity details and sys_updated_by fields.
     * @param {Number} pageNumber - Current page number for pagination.
     * @param {Number} recordsPerPage - Number of records to return per page.
     * @param {String} domain - Domain filter for the query. Defaults to 'global'.
     *
     * @returns {Array<Object>} - A list of matching policy history records.
     */
    getPolicyUpdateData: function(searchTerm, pageNumber, recordsPerPage, domain = "global") {
        try {
            var startNumber = pageNumber * recordsPerPage;
            searchTerm = gs.nil(searchTerm) ? "" : searchTerm;
            domain = gs.nil(domain) ? "global" : domain;
            var countGr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
            NAALlmChangeHistoryUtil._buildPolicyUpdateQuery(countGr, searchTerm, domain);
            countGr.query();
            var totalRecords = countGr.getRowCount();
            var llmHistoryGr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
            NAALlmChangeHistoryUtil._buildPolicyUpdateQuery(llmHistoryGr, searchTerm, domain);
            llmHistoryGr.chooseWindow(startNumber, startNumber + recordsPerPage);
            llmHistoryGr.orderByDesc('sys_created_on');
            llmHistoryGr.query();
            let result = [];
            while (llmHistoryGr.next()) {
                result.push({
                    sys_id: llmHistoryGr.getUniqueValue(),
                    activityDetails: llmHistoryGr.getValue('activity_details'),
                    payload: {
                        providers: NAALlmChangeHistoryUtil._getProviderItems(llmHistoryGr.getValue('allowed_providers')?.split(',')),
                        fallback: llmHistoryGr.getValue('fallback') === '1',
                        routing: llmHistoryGr.getDisplayValue('routing')
                    },
                    updatedOn: NAADateUtil.convertDateFormat(llmHistoryGr.getValue('sys_updated_on')),
                    updatedBy: llmHistoryGr.getDisplayValue('sys_updated_by'),

                });
            }
            return {
                result: result,
                totalRecords: totalRecords,
            };
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.getPolicyUpdateData: " + error.toString());
            return [];
        }
    },

    /**
     * Helper function to get row data for non-compliant skills in presentational list format.
     *
     * @param {Object} row - The row data containing skill details.
     * @returns {Object} - An object representing the row data in presentational list format.
     */
    _getNonComplaintSkillsRowData: function(row) {
        return {
            key: row.id,
            cells: {
                status: {
                    "componentProps": {
                        "size": "md",
                        "hidePadding": false,
                        "bare": true,
                        "tooltipContent": row.status_tooltip,
                        "style": {
                            "background": NAAManageLLMAPI._getStatusColor(row.state),
                            "height": "17px",
                            "width": "17px",
                            "border-radius": "17px",
                            "margin-left": "17px"
                        }
                    }
                },
                skillName: {
                    value: row.name,
                    label: row.name,
                    id: row.id
                },
                product: {
                    value: row.product,
                    label: row.product,
                    id: row.skill_family
                },
                modelProvider: {
                    value: row.providerName,
                    label: row.providerName,
                    id: row.provider
                }
            }
        };
    },


    /**
     * Retrieves non-compliant skills based on the provided policy data.
     *
     * @param {Object} policyData - The policy data containing allowed providers.
     * Example structure for policyPayload : { fallback: true,
                    routing: "regional",
                    providers: [{
                        id: "provider_1",
                        label: "Provider 1"
                    }, {
                        id: "provider_2",
                        label: "Provider 2"
                    }]
                } 
     * @param {String} domain - The domain to filter records by. Defaults to "global".
     * @returns {Object} - An object containing column definitions and rows data for non-compliant skills.
     */
    getNonCompliantOOBSkills: function(policyData, domain = "global") {
        // Call method from NowAssistSkillConfigUtil to the get the data
        try {
            var allowedProviders = {
                ...policyData,
                providers: policyData.providers.filter(provider => provider.allowed)
            };
            var result = NAASkillConfigUtil.getNonComplaintSkills(allowedProviders, false, false);
            var rowsData = {
                "selectionEnabled": false,
                rows: []
            };
            for (let row of result) {
                rowsData.rows.push(NAALlmChangeHistoryUtil._getNonComplaintSkillsRowData(row));
            }

            // Convert to presentational List format
            var columnsData = [
                ["status", sn_i18n.Message.getMessage("sn_nowassist_admin", "Status"), "custom", "now-button-iconic"],
                ["skillName", sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill Name"), "string"],
                ["product", sn_i18n.Message.getMessage("sn_nowassist_admin", "Product"), "string"],
                ["modelProvider", sn_i18n.Message.getMessage("sn_nowassist_admin", "Model provider"), "string"],
            ];

            // return column and RowDefinitions
            return {
                columnDefinitions: NAALlmChangeHistoryUtil._getPresentationalListColumns(columnsData),
                rowsData: rowsData
            };
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.getNonCompliantOOBSkills:" + error.toString());
            return {};
        }
    },

    /**
     * Builds query for Skill Update table
     * 
     * @param {String} searchTerm - A keyword to filter records by matching fields (e.g., activity details, user, providers).
     * @param {String} skillConfigFilter - Skill config sys_id to filter results.
     * @param {String} domain - The domain (sys_domain) to filter records by. Defaults to "global".
     */

    _buildSkillUpdateQuery: function(gr, searchTerm, skillConfigFilter, domain = 'global') {
        var baseCondition = 'activity_type=' + NAAConstant.MANAGE_LLM_CHANGE_HISTORY.TYPE.SKILL + '^sys_domain=' + domain;
        if (skillConfigFilter?.product) {
            baseCondition += '^product=' + skillConfigFilter.product;
        }
        if (skillConfigFilter?.scope) {
            baseCondition += '^scope=' + skillConfigFilter.scope;
        }

        var skillCondition = baseCondition;
        if (searchTerm || searchTerm.length > 0) {
            skillCondition = baseCondition + '^skill_configLIKE' + searchTerm + '^overridden_skill_configISEMPTY' + '^NQ';
            skillCondition += baseCondition + '^overridden_skill_configLIKE' + searchTerm + '^NQ';
            if (!skillConfigFilter?.product) {
                skillCondition += baseCondition + '^productLIKE' + searchTerm + '^NQ';
            }
            if (!skillConfigFilter?.scope) {
                skillCondition += baseCondition + '^scopeLIKE' + searchTerm + '^NQ';
            }
            skillCondition += baseCondition + '^model_providerLIKE' + searchTerm + '^status_codeISEMPTY' + '^NQ';
            skillCondition += baseCondition + '^previous_providerLIKE' + searchTerm + '^status_codeISNOTEMPTY' + '^NQ';
            skillCondition += baseCondition + '^sys_updated_byLIKE' + searchTerm;
        }
        gr.addEncodedQuery(skillCondition);
        gr.orderByDesc('sys_created_on');
    },

    /**
     * Builds query for Skill Update table
     * 
     * @param {String} searchTerm - A keyword to filter records by matching fields (e.g., activity details, user, providers).
     * @param {String} skillConfigFilter - Skill config sys_id to filter results.
     * @param {String} domain - The domain (sys_domain) to filter records by. Defaults to "global".
     */

    _buildPolicyUpdateQuery: function(gr, searchTerm, domain = 'global') {
        var baseCondition = 'activity_type=' + NAAConstant.MANAGE_LLM_CHANGE_HISTORY.TYPE.POLICY + '^sys_domain=' + domain;
        var skillCondition = baseCondition;
        if (searchTerm || searchTerm.length > 0) {
            skillCondition =
                baseCondition + '^activity_detailsLIKE' + searchTerm +
                '^NQ' +
                baseCondition + '^sys_updated_byLIKE' + searchTerm;
        }
        gr.addEncodedQuery(skillCondition);
        gr.orderByDesc('sys_created_on');
    },

    /**
     * Retrieves paginated skill provider update history records from the LLM change history table.
     *
     * @param {String} searchTerm - A keyword to filter records by matching fields (e.g., activity details, user, providers).
     * @param {Number} pageNumber - The page number to retrieve (used for pagination).
     * @param {Number} recordsPerPage - Number of records per page.
     * @param {String} skillConfigFilter - Skill config sys_id to filter results.
     * @param {String} domain - The domain (sys_domain) to filter records by. Defaults to "global".
     *
     * @returns {Array<Object>} - An array of matching history records with key details.
     */
    getSkillUpdateData: function(searchTerm, pageNumber, recordsPerPage, skillConfigFilter, domain = "global") {
        try {
            var startNumber = pageNumber * recordsPerPage;
            searchTerm = gs.nil(searchTerm) ? "" : searchTerm;
            domain = gs.nil(domain) ? "global" : domain;
            var countGr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
            NAALlmChangeHistoryUtil._buildSkillUpdateQuery(countGr, searchTerm, skillConfigFilter, domain);
            countGr.query();
            var totalRecords = countGr.getRowCount();
            var llmHistoryGr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
            NAALlmChangeHistoryUtil._buildSkillUpdateQuery(llmHistoryGr, searchTerm, skillConfigFilter, domain);
            llmHistoryGr.chooseWindow(startNumber, startNumber + recordsPerPage);
            llmHistoryGr.query();
            var result = [];
            while (llmHistoryGr.next()) {
                result.push({
                    sys_id: llmHistoryGr.getUniqueValue(),
                    type: llmHistoryGr.getValue('activity_type'),
                    scope: llmHistoryGr.getDisplayValue('scope'),
                    activityDetails: llmHistoryGr.getValue('activity_details'),
                    skillName: llmHistoryGr.getDisplayValue('overridden_skill_config') === "" ? llmHistoryGr.getDisplayValue('skill_config') : llmHistoryGr.getDisplayValue('overridden_skill_config'),
                    product: llmHistoryGr.getDisplayValue('product'),
                    modelProvider: llmHistoryGr.getDisplayValue('model_provider'),
                    previousProvider: llmHistoryGr.getDisplayValue('previous_provider'),
                    updatedOn: llmHistoryGr.getDisplayValue('sys_updated_on'),
                    updatedBy: llmHistoryGr.getDisplayValue('sys_updated_by'),
                    statusCode: llmHistoryGr.getValue('status_code'),
                });
            }
            return NAALlmChangeHistoryUtil._getSkillDataInPresentationalListFormat(result, totalRecords);
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.getSkillUpdateData: " + error.toString());
            return {};
        }
    },

    /**
     * Inserts a new record into the LLM change history table for a skill provider update.
     *
     * @param {Object} changeObj - Object containing the change details.
     *        {
     *          skill_config: String (sys_id of the skill config),
     *          scope: String (scope of the skill, e.g., "skill_group" or "skill"),
     *          model_provider: String (sys_id of the new model provider),
     *          status_code: String (error code if any, otherwise empty),
     *          previous_provider: String (sys_id of the previous provider)
     *        }
     * @param {String} domain - The domain to assign to the record. Defaults to "global".
     *
     * @returns {String|null} - The sys_id of the inserted record if successful, otherwise null.
     */
    _insertSkillChangeHistoryRecord: function(changeObj, domain = "global") {
        domain = gs.nil(domain) ? "global" : domain;
        var gr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
        gr.initialize();

        gr.activity_type = NAAConstant.MANAGE_LLM_CHANGE_HISTORY.TYPE.SKILL;
        gr.activity_details = sn_i18n.Message.getMessage("sn_nowassist_admin", "Model provider updated");
        gr.skill_config = changeObj?.skill_config;
        gr.overridden_skill_config = changeObj?.skill_config_ui;
        gr.product = changeObj?.product;
        gr.scope = changeObj?.scope;
        gr.model_provider = changeObj?.model_provider;
        gr.status_code = changeObj?.status_code;
        gr.previous_provider = changeObj?.previous_provider;
        gr.sys_domain = domain;

        return gr.insert();
    },

    /**
     * Inserts model provider change history records for each skill config update provided.
     *
     * @param {Array<Object>} changeData - An array of change records. Each object should include:
     *    - skill_config: (String) sys_id from sn_nowassist_skill_config table.
     *    - skill_config_ui: (String) sys_id from sn_nowassist_skill_config_ui table if present else ""
     *    - product: (String) sys_id of product of the skill
     *    - scope: (String) (Choices: "skill", "skill_group", "instance").
     *    - model_provider: (String) sys_id of current provider from sys_generative_ai_provider_mapping table.
     *    - previous_provider: (String) sys_id of previous provider from sys_generative_ai_provider_mapping table.\
     * 	  - status_code: (String) Any error code associated with the update else give "".
     *
     * @param {String} domain - The sys_domain to associate with the record (default: "global").
     */
    setSkillProviderUpdateData: function(changeData, domain = "global") {
        try {
            domain = gs.nil(domain) ? "global" : domain;
            var result = [];
            for (var changeObj of changeData) {
                var sysId = NAALlmChangeHistoryUtil._insertSkillChangeHistoryRecord(changeObj, domain);
                if (sysId) {
                    result.push(sysId);
                }
            }
            return result;
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.setSkillProviderUpdateData function:" + error.toString());
            return [];
        }
    },

    /**
     * Inserts a new record into the LLM change history table for a policy update.
     *
     * @param {Object} changeObj - Object containing the policy change details.
     *        {
     *          allowed_providers: String (comma-separated sys_ids of allowed providers),
     *          fallback: String (fallback model config or identifier),
     *          routing: String (routing logic or configuration)
     *        }
     * @param {String} domain - The domain to assign to the record. Defaults to "global".
     *
     * @returns {String|null} - The sys_id of the inserted record if successful, otherwise null.
     */
    _insertPolicyChangeHistoryRecord: function(changeObj, domain = "global") {
        domain = gs.nil(domain) ? "global" : domain;
        var gr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
        gr.initialize();

        gr.activity_type = NAAConstant.MANAGE_LLM_CHANGE_HISTORY.TYPE.POLICY;
        gr.activity_details = changeObj?.activity_details;
        gr.scope = NAAConstant.MANAGE_LLM_CHANGE_HISTORY.SCOPE.AICT;
        gr.allowed_providers = changeObj?.allowed_providers?.join(',');
        gr.fallback = changeObj?.fallback;
        gr.routing = changeObj?.routing;
        gr.read = false;
        gr.sys_domain = domain;

        return gr.insert();
    },

    /**
     * Checks if non-compliant skills banner should be shown after a policy update.
     *
     * @returns {Boolean} - Returns the value of the 'read' field from the latest policy change entry.
     *                      Returns false if no entry is found or an error occurs.
     */
    showNonCompliantSkillsBannerOnPolicyUpdate: function(domain = "global") {
        try {
            var llmHistoryGr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
            llmHistoryGr.addQuery('activity_type', NAAConstant.MANAGE_LLM_CHANGE_HISTORY.TYPE.POLICY);
            llmHistoryGr.addQuery('sys_domain', domain);
            llmHistoryGr.orderByDesc('sys_created_on');
            llmHistoryGr.setLimit(1);
            llmHistoryGr.query();
            if (llmHistoryGr.next()) {
                return llmHistoryGr.getValue('read') === '0';
            }
            return false;
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.showNonCompliantSkillsBannerOnPolicyUpdate function:" + error.toString());
            return false;
        }
    },

    /**
     * Sets the read flag to true for the most recent LLM policy change,
     * Indicating the non-compliant skills banner has been acknowledged.
     *
     * @returns {Boolean} - True if the update was successful or already set, false otherwise.
     */
    setNonCompliantSkillsBannerFlag: function(domain = "global") {
        try {
            var llmHistoryGr = new GlideRecord(NAAConstant.LLM_CHANGE_HISTORY);
            llmHistoryGr.addQuery('activity_type', NAAConstant.MANAGE_LLM_CHANGE_HISTORY.TYPE.POLICY);
            llmHistoryGr.addQuery('sys_domain', domain);
            llmHistoryGr.orderByDesc('sys_created_on');
            llmHistoryGr.setLimit(1);
            llmHistoryGr.query();
            if (llmHistoryGr.next()) {
                var isRead = llmHistoryGr.getValue('read')?.toString() === 'true';
                if (!isRead) {
                    llmHistoryGr.setValue('read', true);
                    var updatedSysId = llmHistoryGr.update();
                    return !!updatedSysId; // Return true if update was successful
                }
                return true; // Record already marked as read
            }
            return false; // No policy change record found
        } catch (error) {
            gs.error("Error in NAALlmChangeHistoryUtil.setNonCompliantSkillsBannerFlag: " + error.toString());
            return false;
        }
    },

    getProductListForFilter: function() {
        try {
            // Now fetch all product labels
            var result = [];
            var id;
            var familyGr = new GlideRecord(NAAConstant.SKILL_FAMILY);
            familyGr.addEncodedQuery('type=product^ORtype=workflow');
            familyGr.orderBy('name');
            familyGr.query();

            while (familyGr.next()) {
                id = familyGr.getUniqueValue();
                if (familyGr.getValue('type') === "product" || [NAAConstant.OTHER_WORKFLOW_ID, NAAConstant.PLATFORM_WORKFLOW_ID, NAAConstant.CREATOR_WORKFLOW_ID].includes(id)) {
                    result.push({
                        id: id,
                        label: familyGr.getDisplayValue('name')
                    });
                }
            }
            return result;

        } catch (error) {
            gs.error("Failed to fetch products - " + error.toString());
            return [];
        }

    },
    /**
     * Builds a capability map from the provider update object.
     * 
     * @param {Object} providerUpdateObj - The object containing provider update details.
     * @returns {Object} - A map of capabilities with their selection types and codes.
     */
    _buildCapabilityMap: function(providerUpdateObj) {
        var scopeMap = {
            oobSkill: NAAConstant.MANAGE_LLM_CHANGE_HISTORY.SCOPE.SKILL,
            oobSkillGroup: NAAConstant.MANAGE_LLM_CHANGE_HISTORY.SCOPE.SKILL_GROUP,
            instanceLevel: NAAConstant.MANAGE_LLM_CHANGE_HISTORY.SCOPE.INSTANCE
        };

        const capabilityMap = {};
        providerUpdateObj.result.forEach(item => {
            var selectionType = item.selectionType;
            var details = item.response.details;
            var selectedProvider = item.selectedProvider;

            Object.keys(details).forEach(key => {
                var [capabilityId] = key.split(":");
                var code = details[key].code;

                capabilityMap[capabilityId] = {
                    selectionType: scopeMap[selectionType],
                    code: code,
                    selectedProvider: selectedProvider
                };
            });
        });
        return capabilityMap;
    },

    /**
     * Builds a skill configuration UI map from the skill configuration list.
     *
     * @param {Array} skillConfigList - An array of skill configuration IDs.
     * @returns {Object} - A map of skill configuration IDs to their UI record sys_ids.
     */
    _buildSkillConfigUiMap: function(skillConfigList) {
        var skillConfigUiMap = {};
        var skillUiGr = new GlideRecord(NAAConstant.SKILL_CONFIG_UI);
        skillUiGr.addQuery('skill_config', 'IN', skillConfigList.join(','));
        skillUiGr.query();
        while (skillUiGr.next()) {
            skillConfigUiMap[skillUiGr.getValue('skill_config')] = skillUiGr.getUniqueValue();
        }
        return skillConfigUiMap;
    },

    /**
     * Saves the skill provider change history based on the provided update object.
     *
     * @param {Object} providerUpdateObj - The object containing provider update details.
     * @returns {Array<String>} - An array of sys_ids of the inserted records.
     */
    saveSkillProviderChangeHistory: function(providerUpdateObj) {
        var capabilityMap = NAALlmChangeHistoryUtil._buildCapabilityMap(providerUpdateObj);
        var skillConfigUiMap = NAALlmChangeHistoryUtil._buildSkillConfigUiMap(providerUpdateObj.skillList.map(skill => skill.id));
        var changeArray = providerUpdateObj.skillList.map(function(skill) {
            var capability = capabilityMap?.[skill?.capabilityId] || {};

            return {
                skill_config: skill?.id,
                skill_config_ui: skillConfigUiMap[skill?.id],
                scope: capability?.selectionType,
                product: skill?.product_id ?? skill?.workflow_id,
                model_provider: capability?.selectedProvider ?? skill?.selectedProvider,
                previous_provider: skill?.providerId,
                status_code: capability.code
            };
        });

        return NAALlmChangeHistoryUtil.setSkillProviderUpdateData(changeArray, providerUpdateObj.domain);
    },

    type: 'NAALlmChangeHistoryUtil'
};
