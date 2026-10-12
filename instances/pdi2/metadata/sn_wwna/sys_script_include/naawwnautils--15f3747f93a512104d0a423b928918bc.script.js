var NAAWWNAUtils = Class.create();



NAAWWNAUtils.prototype = {
    initialize: function() {
        this.SKILL_FAMILY = "sn_nowassist_skill_family";
        this.SKILL_CONFIG = "sn_nowassist_skill_config";
        this.SKILL_CONFIG_UI = "sn_ns_skill_config_ui";
        this.SKILL_CONFIG_VAR = "sn_nowassist_skill_config_var";
        this.SKILL_CONFIG_VAR_SET = "sn_nowassist_skill_config_var_set";
        this.SKILL_CONFIG_VAR_SET_UI = "sn_ns_skill_config_var_set_ui";
        this.CONFIG_SKILL_M2M = "sn_ns_config_m2m_skill";
        this.SKILL_CONFIG_TYPE = "sn_nowassist_skill_config_type";
        this.GUIDED_SETUP_STATUS = "sn_nowassist_gs_status";
        this.GEN_AI_SKILL_APPLICABILITY = "sys_gen_ai_skill_applicability";
        this.NOW_ASSIST_HELP = "sn_nowassist_help";
        this.SKILL_CONFIG_APP = "sn_nowassist_skill_config_applicability";
        this.SKILL_M2M_SECTION = "sn_nowassist_m2m_prompt_header";
        this.PROMPT_HEADER = "sn_nowassist_prompt_header";
        this.SKILL_CONFIG_STATUS = "sn_nowassist_skill_config_status";
        this.ONE_EXTEND_DEFINITION_CONFIG = "sys_one_extend_definition_config";
        this.ONE_EXTEND_DEFINITION = "sys_one_extend_capability_definition";
        this.ONE_EXTEND_CAPABILITY = 'sys_one_extend_capability';
        this.GEN_AI_FEATURE_MAPPING = 'sys_gen_ai_feature_mapping';
        this.GEN_AI_CONFIG = "sys_generative_ai_config";
        this.SKILL_STATES_LABEL_COLOUR = {
            "draft": {
                'label': gs.getMessage("Draft"),
                "colour": 'warning'
            },
            "active": {
                'label': gs.getMessage("Active"),
                "colour": 'positive'
            },
            "inactive": {
                'label': gs.getMessage("Inactive"),
                "colour": 'orange'
            },
            "notconfigured": {
                'label': gs.getMessage("Not started"),
                "colour": 'low'
            }
        };
        this.logger = new sn_wwna.WWNALogger();
    },
    createAndUpdateVarSet: function(skillConfigId, skillConfigVarSetId, skillConfigVariables = {}, propsForEachComponent = {}) {
        try {
            let listOfColumns = skillConfigVariables.configured_columns;
            let isPreviousConfigTypeTable, isCurrentConfigTypeTable;
            let componentIds = skillConfigVariables.component_ids || '';
            let columnNameToLabelMap = {};
            if (typeof listOfColumns === 'string') {
                listOfColumns = listOfColumns.split(',');
            } else if (typeof listOfColumns === 'object' && !Array.isArray(listOfColumns)) {
                columnNameToLabelMap = JSON.parse(JSON.stringify(listOfColumns));
                listOfColumns = Object.keys(listOfColumns);
                skillConfigVariables.configured_columns = listOfColumns.join(',');
            }
            let propsForVariant = {};
            if (skillConfigVariables.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                propsForVariant = {
                    variant: 'draggable'
                };
            } else if (skillConfigVariables.variant) {
                propsForVariant = {
                    variant: skillConfigVariables.variant
                };
            }

            var utils = new sn_wwna.WWNAUtils();
            if (!componentIds.length && skillConfigVariables.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                isCurrentConfigTypeTable = true;
                componentIds = listOfColumns.map((columnName) => {
                    let tempComponentId = utils.getWWNAComponentId(skillConfigVariables.table, columnName);
                    columnNameToLabelMap[tempComponentId] = columnNameToLabelMap[columnName];
                    return tempComponentId;
                });
            } else if (typeof componentIds === 'string') {
                componentIds = componentIds.split(',');
                componentIds = componentIds.filter((id) => String(id).trim());
            }

            if (!componentIds.length && skillConfigVariables.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.SINGLE) {
                componentIds = [gs.generateGUID()];
                skillConfigVariables.component_ids = componentIds.join(',');
            }

            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            var skillConfig = nowAssistSkillConfig.getSkillConfiguration(skillConfigId, null);
            let generalDetailsVarSet, actionConfigVarSet;
            if (skillConfig.variable_sets.length) {
                for (let i = 0; i < skillConfig.variable_sets.length; i++) {
                    if (skillConfig.variable_sets[i].config_type === sn_wwna.WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID) {
                        generalDetailsVarSet = JSON.parse(JSON.stringify(skillConfig.variable_sets[i]));
                    } else if (skillConfig.variable_sets[i].config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                        actionConfigVarSet = JSON.parse(JSON.stringify(skillConfig.variable_sets[i]));
                    }
                    if (actionConfigVarSet && generalDetailsVarSet) {
                        break;
                    }
                }
            }
            if (generalDetailsVarSet?.props?.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                isPreviousConfigTypeTable = true;
            }
            componentIds = componentIds.reduce((indexedColumnKeys, columnKey) => {
                indexedColumnKeys[columnKey] = true;
                return indexedColumnKeys;
            }, {});

            // let alreadyPresentColumns = {};
            var skillHierarchy = {};
            var deletedRecords = {};
            var newlyCreatedColumns = {};

            let existingVarSetsToUpdate = {};
            let existingVarSetLength = actionConfigVarSet?.override_sets?.length || 0;
            let initialOrderNumber = 100;
            if (existingVarSetLength) {
                initialOrderNumber = Number(actionConfigVarSet.override_sets[existingVarSetLength - 1].order);
                actionConfigVarSet.override_sets.forEach((overrideObj) => {
                    let columnName = overrideObj.title;
                    let sysId = overrideObj.props?.sys_id;
                    let variant = overrideObj.props?.variant;
                    if (componentIds[columnName]) {
                        delete componentIds[columnName];
                        if (propsForVariant.variant && propsForVariant.variant != variant) {
                            existingVarSetsToUpdate[columnName] = sysId;
                        }
                    } else {
                        deletedRecords[columnName] = true;
                        this._deleteVarSet(sysId);
                    }
                });
            }

            Object.keys(componentIds).forEach((columnName, index) => {
                newlyCreatedColumns[columnName] = true;
                let wwnaComponentId = '';
                let newProps = Object.assign({}, {
                    ...propsForVariant
                });
                if (!propsForEachComponent[columnName]) {
                    if (skillConfigVariables.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                        let fieldName = columnName.split('.')[1];
                        wwnaComponentId = fieldName;
                    } else {
                        wwnaComponentId = columnName;
                    }
                    newProps.wwna_component_id = wwnaComponentId;
                }


                this._createOrUpdateSkillConfigVarSet(skillConfigVarSetId, columnName, skillHierarchy, propsForEachComponent[columnName] || newProps, columnNameToLabelMap[columnName], null, index + 1, initialOrderNumber);
            });

            Object.keys(existingVarSetsToUpdate).forEach((columnName) => {
                this._createOrUpdateSkillConfigVarSet(skillConfigVarSetId, columnName, skillHierarchy, propsForVariant, columnNameToLabelMap[columnName], existingVarSetsToUpdate[columnName]);
            });

            let actionForFilter = '';
            if (skillConfigVariables.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                actionForFilter = 'create';
            } else if (isPreviousConfigTypeTable && skillConfigVariables.config_type !== sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                actionForFilter = 'delete';
            }
            if (actionForFilter) {
                this.updateSkillConfigFilters(skillConfigId, skillConfigVariables.table, actionForFilter);
            }
            return {
                success: true,
                skillConfigVariables
            };
        } catch (err) {
            this.logger.error(`WWNA: NACM Create or Update Var Set for SkillConfigId = ${skillConfigId}: ${err.message}`);
            return {
                success: false,
                skillConfigVariables,
                message: gs.getMessage('Failed to save data. Please try again or contact the System Administrator.')
            };
        }
    },
    _deleteVarSet: function(skillConfigVarSetId) {
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.get(skillConfigVarSetId);
        if (skillConfigVarSetGr) {
            skillConfigVarSetGr.deleteRecord();
        }
    },
    _createOrUpdateSkillConfigVarSet: function(parentSkillVarSetId, title, skillHierarchy, props = {}, name, existingVarSetId, index = 1, initialOrderNumber = 100) {
        var newVarSetId = existingVarSetId ? existingVarSetId : this._cloneSkillConfigVarSet(parentSkillVarSetId, {}, false);
        var varSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        varSetGr.get(newVarSetId);
        if (varSetGr.getValue('name')) {

            varSetGr.setValue('name', name || title);
            varSetGr.setValue('title', title);
            varSetGr.setValue('parent', parentSkillVarSetId);
            varSetGr.setValue('hide_step', true);
            if (!existingVarSetId) {
                varSetGr.setValue('order', (initialOrderNumber + index));
            }


            Object.keys(props).forEach((propKey) => {
                if (propKey !== 'sys_id' && propKey !== "sys_meta") {
                    varSetGr.vars[propKey] = props[propKey];
                }
            });
            varSetGr.update();
        }
        return {
            success: true,
            varSetId: newVarSetId
        };
    },
    _cloneSkillConfigVarSet: function(skillConfigVarSetId, skillConfigVarSetHierarchy, isDomainDifferent, valuePairs = {}) {
        var newSkillConfigVarSetId = this._cloneRecord(this.SKILL_CONFIG_VAR_SET, skillConfigVarSetId, isDomainDifferent, valuePairs, true);
        if (!gs.nil(newSkillConfigVarSetId)) {
            //clone skill config var set ui record
            this._cloneRecords(this.SKILL_CONFIG_VAR_SET_UI, {
                "var_set": skillConfigVarSetId
            }, isDomainDifferent, {
                "var_set": newSkillConfigVarSetId
            });

            for (var childSkillConfigVarSetId in skillConfigVarSetHierarchy) {
                valuePairs["parent"] = newSkillConfigVarSetId;
                this._cloneSkillConfigVarSet(childSkillConfigVarSetId, skillConfigVarSetHierarchy[childSkillConfigVarSetId], isDomainDifferent, valuePairs);
            }
        }
        return newSkillConfigVarSetId;
    },

    _cloneRecord: function(table, recordId, isDomainDifferent, valuePairs = {}, hasGlideVars = false) {
        var gr = new GlideRecord(table);
        if (gr.get(recordId)) {
            gr.setValue("sys_domain", null);
            gr.setValue("sys_domain_path", null);
            gr.setValue("sys_overrides", null);

            if (isDomainDifferent) {
                gr.setValue("sys_overrides", gr.getUniqueValue());
            }

            if (hasGlideVars) {
                var variables = {};
                var vars = gr.vars;

                for (var item in vars) {
                    if (item !== "sys_meta" && item !== "sys_id") {
                        variables[item] = vars[item].toString();
                    }
                }

                for (var item in variables) {
                    gr.vars[item] = variables[item];
                }
            }

            for (var key in valuePairs) {
                gr.setValue(key, valuePairs[key]);
            }

            return gr.insert();
        }
        return null;
    },
    _cloneRecords: function(table, query = {}, isDomainDifferent, valuePairs = {}, hasGlideVars = false) {
        var gr = new GlideRecord(table);
        for (var key in query) {
            gr.addQuery(key, query[key]);
        }
        gr.query();

        while (gr.next()) {
            gr.setValue("sys_domain", null);
            gr.setValue("sys_domain_path", null);
            gr.setValue("sys_overrides", null);

            if (isDomainDifferent) {
                gr.setValue("sys_overrides", gr.getUniqueValue());
            }

            if (hasGlideVars) {
                var variables = {};
                var vars = gr.vars;

                for (var item in vars) {
                    if (item !== "sys_meta" && item !== "sys_id") {
                        variables[item] = vars[item].toString();
                    }
                }

                for (var item in variables) {
                    gr.vars[item] = variables[item];
                }
            }

            for (var key in valuePairs) {
                gr.setValue(key, valuePairs[key]);
            }

            gr.insert();
        }
    },
    _getSkillConfigVarSetHierarchy: function(skillConfigId) {
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery("skill_config", skillConfigId);
        skillConfigVarSetGr.addNullQuery("parent");
        skillConfigVarSetGr.query();

        var hierarchyTree = {};
        while (skillConfigVarSetGr.next()) {
            let sysId = skillConfigVarSetGr.getUniqueValue();
            hierarchyTree[sysId] = this._getSkillConfigVarSetChildHierarchy(sysId);
            hierarchyTree[sysId]['name'] = skillConfigVarSetGr.getValue('name');
        }

        return hierarchyTree;
    },
    _getSkillConfigVarSetChildHierarchy: function(skillConfigVarSetId) {
        var hierarchyTree = {};
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery("parent", skillConfigVarSetId);
        skillConfigVarSetGr.query();


        while (skillConfigVarSetGr.next()) {
            let sysId = skillConfigVarSetGr.getUniqueValue();
            hierarchyTree[sysId] = this._getSkillConfigVarSetChildHierarchy(sysId);
            hierarchyTree[sysId]['name'] = skillConfigVarSetGr.getValue('name');
        }

        return hierarchyTree;
    },
    cloneCapabilityAndSkillConfig: function(name, workflowId, productId, parentSkillConfigId = null) {
        let result = {
            success: true,
            skillConfigId: null
        };
        try {
            let payload = {};
            if (!name) {
                throw new Error(gs.getMessage('Name is Required!'));
            }

            payload['name'] = name;

            if (productId) {
                payload['skill_family'] = productId;
            }

            payload.scope = gs.getCurrentApplicationId();

            var capabilityGr = new GlideRecord(this.SKILL_CONFIG);
            capabilityGr.addQuery('name', name);
            capabilityGr.query();
            if (capabilityGr.next()) {
                throw new Error('duplicate record found');
            }
            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            var skillConfigId = nowAssistSkillConfig.duplicateSkillConfig(sn_wwna.WWNAConstants.WWNA_DEFAULT_SKILL_CONFIG_ID, false, {
                ...payload,
                "skill_id": sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID
            });
            result.skillConfigId = skillConfigId;
            this.createM2MSkillToSkillConfig(skillConfigId);
            nowAssistSkillConfig.clearSkillConfigParent(skillConfigId);
            var skillConfigStatusGr = new GlideRecord(this.SKILL_CONFIG_STATUS);
            skillConfigStatusGr.addQuery('skill_config', skillConfigId);
            skillConfigStatusGr.query();
            if (skillConfigStatusGr.next()) {
                skillConfigStatusGr.setValue('in_product_active', true);
                skillConfigStatusGr.update();
            }
            if (parentSkillConfigId) {
                this.createVarSetForSkillConfigMapping(parentSkillConfigId, skillConfigId);
            }
            return result;
        } catch (err) {
            if (err?.message && err.message.toLowerCase().includes('duplicate')) {
                this.logger.error("WWNA: NACM Clone Skill Duplicate Records: " + err.message);
                throw new Error(gs.getMessage('Name already exists'));
            } else {
                this.logger.error("WWNA: NACM Clone Skill: " + err.message);
                throw new Error(gs.getMessage('Failed to clone the configuration!'));
            }
        }
    },
    fetchColumnToLabelMap: function(tableName) {
        let result = {};
        try {
            if (!tableName) {
                return result;
            }
            var utils = new sn_wwna.WWNAUtils();
            var tableList = utils._getRootTableFromHierarchy(tableName, true);
            var dictionaryGr = new GlideRecord('sys_dictionary');
            dictionaryGr.addQuery('name', 'IN', tableList);
            dictionaryGr.orderBy('column_label');
            dictionaryGr.query();
            let elementName, elementLabel;
            let index = 0;
            while (dictionaryGr.next()) {
                elementName = dictionaryGr.getValue('element');
                if (elementName && /^(?!sys_).*/.test(elementName)) {
                    elementLabel = dictionaryGr.getValue('column_label');
                    result[elementName] = {
                        id: elementName,
                        label: elementLabel,
                        index: index,
                        key: elementName
                    };
                    index += 1;
                }
            }
            return result;
        } catch (err) {
            this.logger.error('WWNA: Error while fetching column List: ' + err?.message);
            return result;
        }

    },
    migrateExistingConfig: function(existingSkillConfigId, name) {
        let result = {
            success: true,
            message: '',
            newConfigId: '',
            newConfigIds: [],
            failedVariableSetIds: []
        };
        try {
            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            var utils = new sn_wwna.WWNAUtils();
            let existingSkillConfigObject = nowAssistSkillConfig.getSkillConfiguration(existingSkillConfigId, null);
            let columnToLabelMap = {};
            let generalDetailsProps = {
                config_type: sn_wwna.WWNAConstants.CONFIG_TYPE.SINGLE,
                config_sub_type: '',
                configured_columns: [],
                component_ids: [],
                table: ''
            };
            let configuredColumnMap = {};
            if (existingSkillConfigObject?.variable_sets?.length) {
                var existingSkillConfigGr = new GlideRecord(this.SKILL_CONFIG);
                existingSkillConfigGr.get(existingSkillConfigId);
                let existingSkillFamilyId = existingSkillConfigGr.skill_family?.parent?.toString() || existingSkillConfigGr.getValue('skill_family');
                if (!name) {
                    name = existingSkillConfigObject.name + ' V2';
                }
                let configsToBeMigrated = {};
                let tableWiseColumnMap = {};
                existingSkillConfigObject.variable_sets.forEach((variableSetObj) => {
                    if (variableSetObj.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                        let table = variableSetObj.props.table;
                        let configType = sn_wwna.WWNAConstants.CONFIG_TYPE.SINGLE;
                        let configuredColumns = [];
                        if (!tableWiseColumnMap[table]) {
                            tableWiseColumnMap[table] = this.fetchColumnToLabelMap(table);
                        }
                        if (variableSetObj.props.configured_columns.length) {
                            configType = sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE;
                            if (typeof variableSetObj.props.configured_columns === 'string') {
                                configuredColumns = variableSetObj.props.configured_columns.split(',');
                            }
                        } else if (tableWiseColumnMap[table][variableSetObj.props.wwna_component_id]) {
                            configType = sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE;
                            configuredColumns.push(variableSetObj.props.wwna_component_id);
                        }
                        if (!configsToBeMigrated[table]) {
                            configsToBeMigrated[table] = {};
                        }
                        if (!configsToBeMigrated[table][configType]) {
                            configsToBeMigrated[table][configType] = {
                                data: [],
                                varSetIds: {}
                            };
                        }

                        if (configType === sn_wwna.WWNAConstants.CONFIG_TYPE.SINGLE) {
                            configsToBeMigrated[table][configType].varSetIds[variableSetObj.props.sys_id] = true;
                            configsToBeMigrated[table][configType].data.push({
                                props: variableSetObj.props
                            });
                        } else if (configType === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                            configsToBeMigrated[table][configType].varSetIds[variableSetObj.props.sys_id] = true;
                            if (configsToBeMigrated[table][configType].data[0]) {
                                configuredColumns.forEach((columnName) => {
                                    configsToBeMigrated[table][configType].data[0].props.configured_columns[columnName] = true;
                                });
                            } else {
                                let tempTableProps = variableSetObj.props;
                                tempTableProps.configured_columns = {};
                                configuredColumns.forEach((columnName) => {
                                    tempTableProps.configured_columns[columnName] = true;
                                });
                                configsToBeMigrated[table][configType].data.push({
                                    props: tempTableProps
                                });
                            }
                        }
                    }
                });
                let count = 1;

                let configTables = Object.keys(configsToBeMigrated);
                configTables.forEach((tableName) => {
                    let configTypes = Object.keys(configsToBeMigrated[tableName]);
                    configTypes.forEach((configType) => {
                        configsToBeMigrated[tableName][configType].data.forEach((configObject) => {
                            try {
                                let newName = (configTables.length === 1 && configTypes.length === 1 && configsToBeMigrated[tableName][configType].data.length === 1) ? name : `${name} V${String(count)}`;
                                count += 1;
                                let clonedResult = this.cloneCapabilityAndSkillConfig(newName, null, existingSkillFamilyId, existingSkillConfigId);
                                let newConfigId = clonedResult.skillConfigId;
                                if (!newConfigId) {
                                    if (configType === sn_wwna.WWNAConstants.CONFIG_TYPE.SINGLE) {
                                        result.failedVariableSetIds.push(configObject.props.sys_id);
                                        delete configsToBeMigrated[tableName][configType].varSetIds[configObject.props.sys_id];
                                    } else {
                                        result.failedVariableSetIds = result.failedVariableSetIds.concat(Object.keys(configsToBeMigrated[tableName][configType].varSetIds));
                                        configsToBeMigrated[tableName][configType].varSetIds = {};
                                    }
                                } else {
                                    let currentSkillConfigObj = nowAssistSkillConfig.getSkillConfiguration(newConfigId);
                                    let generalDetailsVarSet, actionDetailsVarSet;
                                    let generalDetailsProps = {
                                        config_type: configType,
                                        config_sub_type: '',
                                        configured_columns: [],
                                        component_ids: [],
                                        table: tableName
                                    };
                                    if (currentSkillConfigObj.variable_sets.length) {
                                        for (let i = 0; i < currentSkillConfigObj.variable_sets.length; i++) {
                                            if (currentSkillConfigObj.variable_sets[i].config_type === sn_wwna.WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID) {
                                                generalDetailsVarSet = currentSkillConfigObj.variable_sets[i];
                                            } else if (currentSkillConfigObj.variable_sets[i].config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                                                actionDetailsVarSet = currentSkillConfigObj.variable_sets[i];
                                            }
                                            if (generalDetailsVarSet && actionDetailsVarSet) {
                                                break;
                                            }
                                        }
                                        if (generalDetailsVarSet && actionDetailsVarSet) {
                                            let propsForEachComponent = {};
                                            let configuredColumnMap = {};


                                            let tempProps = Object.assign({}, JSON.parse(JSON.stringify(configObject.props)));
                                            delete tempProps.table;
                                            delete tempProps.configured_columns;
                                            if (configType === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                                                generalDetailsProps.configured_columns = Object.keys(configObject.props.configured_columns);
                                                generalDetailsProps.configured_columns.forEach((columnName) => {
                                                    configuredColumnMap[columnName] = configuredColumnMap[columnName] || tableWiseColumnMap[tableName][columnName]?.label || '';
                                                    let wwnaComponentId = utils.getWWNAComponentId(generalDetailsProps.table, columnName);
                                                    let tempColumnObject = Object.assign({}, JSON.parse(JSON.stringify(tempProps)));
                                                    tempColumnObject.wwna_component_id = columnName;
                                                    propsForEachComponent[wwnaComponentId] = tempColumnObject;
                                                });
                                            } else {
                                                generalDetailsProps.component_ids.push(tempProps.wwna_component_id);
                                                propsForEachComponent[configObject.props.wwna_component_id] = tempProps;
                                            }
                                            generalDetailsProps.component_ids = generalDetailsProps.component_ids.join(',');
                                            generalDetailsProps.configured_columns = generalDetailsProps.configured_columns.join(',');
                                            var generalDetailsVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
                                            generalDetailsVarSetGr.get(generalDetailsVarSet.props.sys_id);
                                            if (generalDetailsVarSetGr.getUniqueValue()) {
                                                Object.keys(generalDetailsProps).forEach((propKey) => {
                                                    generalDetailsVarSetGr.vars[propKey] = generalDetailsProps[propKey];
                                                });
                                                generalDetailsVarSetGr.update();
                                            }
                                            this.createAndUpdateVarSet(newConfigId, actionDetailsVarSet.props.sys_id, {
                                                ...generalDetailsProps,
                                                configured_columns: configuredColumnMap
                                            }, propsForEachComponent);

                                            result.newConfigIds.push(newConfigId);
                                            if (configType === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                                                let varSetIdsToDelete = Object.keys(configsToBeMigrated[tableName][configType].varSetIds);
                                                varSetIdsToDelete.forEach((varSetId) => {
                                                    this._deleteVarSet(varSetId);
                                                });
                                            } else {
                                                this._deleteVarSet(configObject.props.sys_id);
                                            }

                                            var applicabilityGr = new GlideRecord(this.SKILL_CONFIG_APP);
                                            applicabilityGr.initialize();
                                            applicabilityGr.setValue('skill_config', newConfigId);
                                            applicabilityGr.setValue('filter_parameters', JSON.stringify({
                                                parentSkillConfigId: existingSkillConfigId
                                            }));
                                            applicabilityGr.insert();
                                        }
                                    }
                                }
                            } catch (error) {
                                let variableSet = '';
                                if (configType === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE) {
                                    variableSet = Object.keys(configsToBeMigrated[tableName][configType].varSetIds).join(',');
                                } else {
                                    variableSet = configObject?.props?.sys_id;
                                }
                                gs.info(`Migration Failed for the following varsetIds : ${variableSet} Error: ${error?.message}`);
                            }
                        });
                    });
                });

            } else {
                result.success = false;
                result.message = 'No Var Set Record Found!';
            }
            return result;
        } catch (err) {
            result.success = false;
            result.message = (err && err.message) || 'Error: Failed To Migrate the Config';
            return result;
        }
    },
    createM2MSkillToSkillConfig: function(skillSysId) {
        if (!skillSysId)
            return;

        let existingSkillMapGr = new GlideRecord(this.CONFIG_SKILL_M2M);
        existingSkillMapGr.addQuery('skill_id', sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID);
        existingSkillMapGr.addQuery('skill_config', skillSysId);
        existingSkillMapGr.query();
        if (existingSkillMapGr.next()) {
            return;
        }
        let skillMapGr = new GlideRecord(this.CONFIG_SKILL_M2M);
        skillMapGr.initialize();
        skillMapGr.setValue('skill_id', sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID);
        skillMapGr.setValue('skill_table', 'sys_one_extend_capability');
        skillMapGr.setValue('skill_config', skillSysId);
        skillMapGr.insert();
        return;
    },
    updateDefinitionConfig: function(skillId) {
        var oneExtendDefConfigGr = new GlideRecord(this.ONE_EXTEND_DEFINITION_CONFIG);
        oneExtendDefConfigGr.addQuery('capability', skillId);
        oneExtendDefConfigGr.query();
        while (oneExtendDefConfigGr.next()) {
            oneExtendDefConfigGr.setValue('default', true);
            oneExtendDefConfigGr.update();
        }
        return;
    },
    updateSkillNameAndDescription: function(skill_config_id, skill_name, skill_description, skill_order) {
        let result = {
            success: true,
            message: ''
        };
        if (!skill_name) {
            result.success = false;
            result.message = gs.getMessage('Name is Required');
            return result;
        }
        var skillConfigGr = new GlideRecord(this.SKILL_CONFIG);
        skillConfigGr.get(skill_config_id);
        let currentName = skillConfigGr.getValue('name');
        let currentDescription = skillConfigGr.getValue('description');
        let currentOrder = skillConfigGr.getValue('order');
        if (currentName) {
            if (currentName === skill_name && currentDescription === skill_description && currentOrder === skill_order) {
                return result;
            } else {
                if (currentName !== skill_name) {
                    var existingSkillConfigGr = new GlideRecord(this.SKILL_CONFIG);
                    existingSkillConfigGr.addQuery('name', skill_name);
                    existingSkillConfigGr.query();
                    if (existingSkillConfigGr.next()) {
                        result.success = false;
                        result.message = gs.getMessage('Skill Config Name Already Exists');
                        return result;
                    }
                }
                skillConfigGr.setValue('name', skill_name);
                skillConfigGr.setValue('description', skill_description);
                skillConfigGr.setValue('order', skill_order);
                skillConfigGr.update();
            }
        } else {
            result.success = false;
            result.message = gs.getMessage('Skill Config Not Found!');
        }
        return result;
    },
    fetchAdminConfigs: function(skillConfigId) {
        let result = {
            shouldDisableFields: false,
            fieldToDisable: {}
        };
        if (!skillConfigId) {
            return result;
        }
        let skillConfigSysIdMap = {
            [skillConfigId]: {}
        };
        var applicabilityGr = new GlideRecord(this.SKILL_CONFIG_APP);
        applicabilityGr.addQuery('skill_config', skillConfigId);
        applicabilityGr.query();
        let parentSkillConfigId;
        while (applicabilityGr.next()) {
            let filter = applicabilityGr.getValue('filter_parameters');
            if (typeof filter === 'string') {
                filter = JSON.parse(filter);
            }

            if (filter['parentSkillConfigId']) {
                parentSkillConfigId = filter['parentSkillConfigId'];
                break;
            }
        }

        if (parentSkillConfigId) {
            skillConfigSysIdMap[parentSkillConfigId] = {};
        }
        var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
        var varSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);

        varSetGr.addQuery('skill_config', 'IN', Object.keys(skillConfigSysIdMap));
        varSetGr.addQuery('config_type', sn_wwna.WWNAConstants.WWNA_ADMIN_CONFIG_TYPE_ID);
        varSetGr.query();
        while (varSetGr.next()) {
            let currentVarSetId = varSetGr.getValue('skill_config');
            let varSetGrInfo = nowAssistSkillConfig._getVariableSetInfo(varSetGr, false);
            if (varSetGrInfo?.props) {

                skillConfigSysIdMap[currentVarSetId] = varSetGrInfo.props;
            }
        }
        let tempResult;
        if (Object.keys(skillConfigSysIdMap[parentSkillConfigId] || {}).length) {
            tempResult = skillConfigSysIdMap[parentSkillConfigId];
        } else {
            tempResult = skillConfigSysIdMap[skillConfigId];
        }
        result.shouldDisableFields = String(tempResult?.should_disable_fields) === 'true' ? true : false;
        if (result.shouldDisableFields && tempResult?.fields_to_disable?.length) {
            var variableGr = new GlideRecord(this.SKILL_CONFIG_VAR);
            variableGr.addQuery('sys_id', 'IN', tempResult?.fields_to_disable);
            variableGr.query();
            while (variableGr.next()) {
                result.fieldToDisable[variableGr.getValue('element')] = true;
            }
        }
        return result;
    },
    fetchM2MSkillMap: function(shouldFetchConfigStatus = false, skillConfigIds = []) {
        let result = {};
        var m2mSkillMapGr = new GlideAggregate(this.CONFIG_SKILL_M2M);
        m2mSkillMapGr.addQuery('skill_id', sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID);
        if (skillConfigIds && skillConfigIds.length) {
            m2mSkillMapGr.addQuery('skill_config', 'IN', skillConfigIds);
        }
        m2mSkillMapGr.groupBy('skill_id');
        m2mSkillMapGr.addAggregate('GROUP_CONCAT_DISTINCT', 'skill_config.sys_id');
        m2mSkillMapGr.query();
        let nacmSkillConfigIds = [];
        while (m2mSkillMapGr.next()) {
            let tempSkillConfigIds = m2mSkillMapGr.getAggregate('GROUP_CONCAT_DISTINCT', 'skill_config.sys_id');
            tempSkillConfigIds = (tempSkillConfigIds || '').split(',');
            nacmSkillConfigIds = nacmSkillConfigIds.concat(tempSkillConfigIds);
        }
        result = nacmSkillConfigIds.reduce((indexedSkillConfigId, skillConfigId) => {
            indexedSkillConfigId[skillConfigId] = {};
            return indexedSkillConfigId;
        }, {});
        const trueValues = ['1', 'true'];
        if (shouldFetchConfigStatus && nacmSkillConfigIds.length) {
            let skillConfigStatusGr = new GlideRecord(this.SKILL_CONFIG_STATUS);
            skillConfigStatusGr.addQuery('skill_config', 'IN', nacmSkillConfigIds);
            skillConfigStatusGr.query();
            while (skillConfigStatusGr.next()) {
                let tempSkillConfigId = skillConfigStatusGr.getValue('skill_config');
                result[tempSkillConfigId].active = trueValues.includes(String(skillConfigStatusGr.getValue('active'))) ? true : false;
            }
        }
        return result;
    },
    finalizeAndPublishGenAIConfig: function(capabilityId) {
        let result = {
            success: true
        };
        try {
            if (!capabilityId) {
                return result;
            }
            var definitionGr = new GlideRecord(this.ONE_EXTEND_DEFINITION);
            definitionGr.addQuery('capability', capabilityId);
            definitionGr.setLimit(1);
            definitionGr.query();
            if (definitionGr.next()) {
                let definitionId = definitionGr.getUniqueValue();
                let genAiPromptGr = new GlideRecord(this.GEN_AI_CONFIG);
                genAiPromptGr.addQuery('definition', definitionId);
                genAiPromptGr.query();
                while (genAiPromptGr.next()) {
                    let genAiConfigId = genAiPromptGr.getUniqueValue();
                    let isFinalized = sn_one_extend.GenerativeAIUtility.finalizeGenerativeAIConfig(genAiConfigId);
                    if (isFinalized) {
                        let isPublished = sn_one_extend.GenerativeAIUtility.publishGenerativeAIConfig(genAiConfigId, false);
                    }
                }
            }
            return result;
        } catch (err) {
            result.success = false;
            result.message = err?.message;
            this.logger.error(`WWNA: NACM Failed to Finalize & Publish Prompts Error: ${result.message}`);
            return result;
        }

    },
    updateSkillConfigFilters: function(skillConfigId, tableName, actionType) {
        if (!skillConfigId) {
            return;
        }
        var applicabilityGr = new GlideRecord(this.SKILL_CONFIG_APP);
        applicabilityGr.addQuery('skill_config', skillConfigId);
        applicabilityGr.query();
        const rowCount = applicabilityGr.getRowCount();
        const keysToUpdateOrDelete = ['table'];
        if (rowCount) {
            while (applicabilityGr.next()) {
                let filter = applicabilityGr.getValue('filter_parameters') || '';
                if (typeof filter === 'string') {
                    filter = JSON.parse(filter || '{}');
                } else {
                    filter = filter || {};
                }
                keysToUpdateOrDelete.forEach((key) => {
                    if (actionType === 'create') {
                        filter[key] = key === 'table' ? tableName : 'true';
                    } else {
                        delete filter[key];
                    }
                });
                if (!Object.keys(filter).length) {
                    applicabilityGr.deleteRecord();
                } else {
                    applicabilityGr.setValue('filter_parameters', JSON.stringify(filter));
                    applicabilityGr.update();
                }
            }
        } else if (actionType === 'create') {
            applicabilityGr = new GlideRecord(this.SKILL_CONFIG_APP);
            applicabilityGr.initialize();
            applicabilityGr.setValue('skill_config', skillConfigId);
            let filterParams = {};
            keysToUpdateOrDelete.forEach((key) => {
                filterParams[key] = key === 'table' ? tableName : 'true';
            });
            applicabilityGr.setValue('filter_parameters', JSON.stringify(filterParams));
            applicabilityGr.insert();
        }
    },
    updateMappedNACMConfig: function(skillConfigRecord) {
        var varSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        varSetGr.addQuery('skill_config', skillConfigRecord.skill_config);
        varSetGr.addQuery('config_type', sn_wwna.WWNAConstants.WWNA_NACM_CONFIG_MAPPING_TYPE_ID);
        varSetGr.query();
        var wwnaQuickActionGr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
        wwnaQuickActionGr.addQuery('skill', skillConfigRecord.skill_config.skill_id);
        wwnaQuickActionGr.query();
        const isSkillCreatedThroughSkillKit = wwnaQuickActionGr.getRowCount() ? true : false;
        while (varSetGr.next()) {
            let skillConfigIdsToUpdate = varSetGr.vars['nacm_config'] || '';
            skillConfigIdsToUpdate = skillConfigIdsToUpdate.split(',');
            if (skillConfigIdsToUpdate.length) {
                var statusGr = new GlideRecord(this.SKILL_CONFIG_STATUS);
                statusGr.addQuery('skill_config', 'IN', skillConfigIdsToUpdate);
                statusGr.query();
                while (statusGr.next()) {
                    if (skillConfigRecord.active) {
                        // activate it only if Configure Experience Page is Completed
                        var stepStatus = new GlideRecord(this.GUIDED_SETUP_STATUS);
                        stepStatus.addQuery('skill_config', statusGr.skill_config);
                        stepStatus.addQuery('gs_status', true);
                        stepStatus.addQuery('var_set.config_type', sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID);
                        stepStatus.query();
                        if (stepStatus.next()) {
                            statusGr.setValue('active', true);
                        }
                    } else {
                        statusGr.setValue('active', false);
                    }
                    if (!isSkillCreatedThroughSkillKit) {
                        statusGr.setValue('in_product_active', skillConfigRecord.in_product_active);
                    }
                    statusGr.update();
                }
            }

        }
        return;
    },
    createVarSetForSkillConfigMapping: function(parentSkillConfigId, skillConfigId) {
        var skillConfigVarSetGr = new GlideRecord(this.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery('config_type', sn_wwna.WWNAConstants.WWNA_NACM_CONFIG_MAPPING_TYPE_ID);
        skillConfigVarSetGr.addQuery('skill_config', parentSkillConfigId);
        skillConfigVarSetGr.query();
        if (skillConfigVarSetGr.next()) {
            var mappedSkillConfigIds = skillConfigVarSetGr.vars['nacm_config'];
            if (!mappedSkillConfigIds.includes(skillConfigId)) {
                mappedSkillConfigIds = mappedSkillConfigIds.split(',');
                mappedSkillConfigIds.push(skillConfigId);
                skillConfigVarSetGr.vars['nacm_config'] = mappedSkillConfigIds.join(',');
            }
            skillConfigVarSetGr.update();
        } else {
            skillConfigVarSetGr.initialize();
            skillConfigVarSetGr.setValue('name', 'NACM Skill Configuration Mapping');
            skillConfigVarSetGr.setValue('skill_config', parentSkillConfigId);
            skillConfigVarSetGr.setValue('config_type', sn_wwna.WWNAConstants.WWNA_NACM_CONFIG_MAPPING_TYPE_ID);
            skillConfigVarSetGr.setValue('hide_step', true);
            skillConfigVarSetGr.setValue('order', 100);
            skillConfigVarSetGr.insert();
            skillConfigVarSetGr.vars['nacm_config'] = skillConfigId;
            skillConfigVarSetGr.update();
        }

        return;
    },
    getSkillConfigIdFromCapabilityId: function(capabilityId) {
        var skillConfigId = null;
        if (capabilityId) {
            try {
                var gr = new GlideRecord(this.SKILL_CONFIG);
                gr.addQuery('skill_id', capabilityId);
                gr.query();
                if (gr.next()) {
                    skillConfigId = gr.getUniqueValue();
                }
            } catch (err) {
                this.logger.error('WWNA: Failed to fetch Skill Config Id from Capability Id: ' + err.message);
            }
        }
        return skillConfigId;
    },
    getVariableList: function(configType) {
        let result = [];
        if (!configType) {
            return result;
        }
        try {
            var gr = new GlideRecord(this.SKILL_CONFIG_VAR);
            gr.addQuery('model', configType);
            gr.query();
            while (gr.next()) {
                result.push({
                    variableId: gr.getUniqueValue(),
                    columnName: gr.getValue('element'),
                    columnLabel: gr.getValue('column_label'),
                    type: gr.getValue('internal_type')
                });
            }
            return result;
        } catch (err) {
            this.logger.error('WWNA: Error while fetching Skill Config Variables: ' + err.message);
            return result;
        }
    },
    getExistingVarSetByColumn: function(table, configuredColumns = [], skillConfigIdsToExclude = []) {
        let result = {};
        try {

            if (!table || (!configuredColumns || (configuredColumns && !configuredColumns.length))) {
                return result;
            }
            if (!skillConfigIdsToExclude) {
                skillConfigIdsToExclude = [];
            }
            let skillConfigIdsToExcludeSet = new Set(skillConfigIdsToExclude);
            const configuredColumnSet = new Set(configuredColumns);

            const NACM_CONFIG_TYPES = [sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID, sn_wwna.WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID];
            // NOTE: Can enable this once merging of parent and child is supported
            // let utils = new sn_wwna.WWNAUtils();
            // let tableList = utils._getRootTableFromHierarchy(table, true);
            let tableList = [table];
            let gr = new GlideAggregate('sys_variable_value');
            let baseEncodedQuery = 'document=sn_nowassist_skill_config_var_set';
            let query = baseEncodedQuery + `^variable.element=table^valueIN${tableList.join(',')}`;
            query += (`^NQ${baseEncodedQuery}^variable.element=configured_columns` + configuredColumns.reduce((entireQuery, current, index) => {
                if (index === 0) {
                    entireQuery += (`^valueLIKE${current}`);
                } else {
                    entireQuery += (`^ORvalueLIKE${current}`);
                }
                return entireQuery;
            }, ''));

            gr.addEncodedQuery(query);
            gr.groupBy('document_key');
            gr.addAggregate('GROUP_CONCAT_DISTINCT', 'document_key');
            gr.query();

            var skillConfigNames = [];
            let skillConfigIds = new Set();
            while (gr.next()) {
                var config_type = gr.document_key.config_type.toString();

                if (NACM_CONFIG_TYPES.includes(config_type)) {
                    let varSetTable = String(gr.document_key.vars['table'] || '');
                    let columns = String(gr.document_key.vars['configured_columns'] || '').split(',');
                    let skillConfig = gr.document_key.skill_config;
                    const skillConfigId = String(skillConfig.sys_id);

                    if (!skillConfigIdsToExcludeSet.has(skillConfigId) && tableList.includes(varSetTable) && columns.some((columnName) => configuredColumnSet.has(columnName))) {
                        skillConfigIds.add(skillConfigId);
                        let tempObject = {
                            skillConfigId: skillConfigId,
                            skillConfigName: String(skillConfig.name),
                            order: String(skillConfig.order || '-'),
                            skillConfigVarSetId: String(gr.document_key),
                            skillConfigVarSetName: String(gr.document_key.name),
                            skillConfigVarSetOrder: String(gr.document_key.order),
                            table: varSetTable,
                            configuredColumns: columns,
                            configuredColumnsSet: new Set(columns)
                        };
                        skillConfigNames.push(tempObject);
                    }

                }
            }
            skillConfigIds = [...skillConfigIds];
            let skillConfigStateDetails = {};

            if (skillConfigIds.length) {
                let guidedStepStatusGr = new GlideAggregate(this.GUIDED_SETUP_STATUS);
                guidedStepStatusGr.addNotNullQuery('skill_config');
                guidedStepStatusGr.addNotNullQuery('var_set');
                guidedStepStatusGr.addQuery('var_set', '!=', 'define-access');
                guidedStepStatusGr.addQuery('gs_status', true);
                guidedStepStatusGr.groupBy('skill_config');
                guidedStepStatusGr.addAggregate('COUNT', 'var_set');
                guidedStepStatusGr.query();
                while (guidedStepStatusGr.next()) {
                    skillConfigStateDetails[guidedStepStatusGr.getValue('skill_config')] = {
                        state: 'draft'
                    };
                }
                var skillConfigStatusGr = new GlideRecord(this.SKILL_CONFIG_STATUS);
                skillConfigStatusGr.addQuery('skill_config', 'IN', skillConfigIds);
                skillConfigStatusGr.query();
                while (skillConfigStatusGr.next()) {
                    const isActive = ['true', '1'].includes(String(skillConfigStatusGr.getValue('active'))) ? true : false;
                    const skillConfigId = skillConfigStatusGr.getValue('skill_config');
                    if (isActive) {
                        skillConfigStateDetails[skillConfigId] = {
                            state: 'active'
                        };
                    } else if (skillConfigStateDetails[skillConfigId]) {
                        skillConfigStateDetails[skillConfigId] = {
                            state: 'inactive'
                        };
                    } else {
                        skillConfigStateDetails[skillConfigId] = {
                            state: 'notconfigured'
                        };
                    }
                }
            }

            configuredColumns.forEach((columnName) => {
                if (!result[columnName]) {
                    result[columnName] = [];
                }
                skillConfigNames.forEach((skillConfig) => {
                    if (skillConfig.configuredColumnsSet.has(columnName)) {
                        const skillConfigId = skillConfig.skillConfigId;
                        if (!skillConfig.skillStateDetails) {
                            if (skillConfigStateDetails[skillConfigId]?.state) {
                                skillConfig.skillStateDetails = this.SKILL_STATES_LABEL_COLOUR[skillConfigStateDetails[skillConfigId].state];
                            } else {
                                skillConfig.skillStateDetails = this.SKILL_STATES_LABEL_COLOUR.notconfigured;
                            }
                        }
                        result[columnName].push(skillConfig);
                    }
                });
            });

            return result;
        } catch (err) {
            this.logger.error('WWNA: Error while fetching Existing Skill Config Details: ' + err?.message);
            return result;
        }
    },
    type: 'NAAWWNAUtils'
};
