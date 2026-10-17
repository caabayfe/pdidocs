var WWNAUtils = Class.create();


function checkIfSkillConfigIsValid(skillConfig, skillConfigId, skipSkillConfigIdCheck = false) {
    if (!skillConfig.is_wwna_active || (!skipSkillConfigIdCheck && !skillConfig.active) || !skillConfig.in_product_active || !skillConfig.isInProductRolesSatisfied || (!skipSkillConfigIdCheck && skillConfig.sys_id === skillConfigId)) {
        return false;
    }
    return true;
}

function isTargetDateGreaterThanSourceDate(targetDate, sourceDate) {
    let result = new GlideDateTime(targetDate).compareTo(new GlideDateTime(sourceDate));
    if (String(result) === "1") {
        return true;
    } else {
        return false;
    }
}

function mergeVarSetProps(target, source, configVariables, actionKeys) {
    let shouldOvverideOtherVariables = false;
    if (source.skillConfigOrder && !isNaN(source.skillConfigOrder)) {
        if (target.skillConfigOrder && !isNaN(target.skillConfigOrder)) {
            if (Number(target.skillConfigOrder) > Number(source.skillConfigOrder)) {
                shouldOvverideOtherVariables = true;
            } else if (Number(target.skillConfigOrder) === Number(source.skillConfigOrder) && !isTargetDateGreaterThanSourceDate(target.skillConfigSysUpdatedOn, source.skillConfigSysUpdatedOn)) {
                shouldOvverideOtherVariables = true;
            }
        } else {
            shouldOvverideOtherVariables = true;
        }
    }

    if (source.props.default_preset_action?.length) {
        if (target.props.default_preset_action?.length) {
            if (!target.props.hasDefaultActionBeDiscarded && target.props.default_preset_action !== source.props.default_preset_action) {
                target.props.preset_actions = appendActions(target.props.preset_actions, target.props.default_preset_action);
                target.props.default_preset_action = '';
                target.props.preset_actions = appendActions(target.props.preset_actions, source.props.default_preset_action);
                source.props.default_preset_action = '';
                target.props.hasDefaultActionBeDiscarded = true;
            }
        } else if (target.props.hasDefaultActionBeDiscarded) {
            target.props.preset_actions = appendActions(target.props.preset_actions, source.props.default_preset_action);
            source.props.default_preset_action = '';
        } else {
            target.props.default_preset_action = source.props.default_preset_action;
            source.props.default_preset_action = '';
        }
    }
    if (shouldOvverideOtherVariables) {
        target.skill_id = source.skill_id;
        target.skillConfigSysUpdatedOn = source.skillConfigSysUpdatedOn;
        target.skillConfigOrder = source.skillConfigOrder;
        target.preferredConfigVarSetId = source.props.sys_id;
        target.preferredConfigId = source.skillConfigId;
        configVariables.forEach((configVariable) => {
            const element = configVariable.columnName;
            if (actionKeys.includes(element)) {
                target.props[element] = appendActions(target.props[element], source.props[element]);
            } else {
                target.props[element] = source.props[element];
            }
        });
    } else {
        actionKeys.forEach((actionKey) => {
            target.props[actionKey] = appendActions(target.props[actionKey], source.props[actionKey]);
        });
    }

    return target;
}

function addOrUpdateVariableSetToIndex(indexedVariableSet, newVariableSet, componentId, nacmConfigVariables, actionKeys, tableName) {
    if (!indexedVariableSet[componentId]) {

        indexedVariableSet[componentId] = JSON.parse(JSON.stringify(newVariableSet));
        if (indexedVariableSet[componentId].props.wwna_component_id !== componentId) {
            indexedVariableSet[componentId].props.wwna_component_id = componentId;
        }

        if (indexedVariableSet[componentId].props.table !== tableName) {
            indexedVariableSet[componentId].props.table = tableName;
        }
        indexedVariableSet[componentId].props.hasDefaultActionBeDiscarded = false;
        indexedVariableSet[componentId].preferredConfigVarSetId = newVariableSet.props.sys_id;
        indexedVariableSet[componentId].preferredConfigId = newVariableSet.skillConfigId;
    } else {
        mergeVarSetProps(indexedVariableSet[componentId], newVariableSet, nacmConfigVariables, actionKeys, componentId);
    }
    return indexedVariableSet;

}

function checkBooleanValue(existingValue, newValue) {
    if (String(existingValue) === "true") {
        return existingValue;
    } else {
        return newValue;
    }
}


function appendActions(existingActions = '', newActions = '') {
    let updatedActions = '';
    if (existingActions?.length) {
        if (newActions?.length) {
            updatedActions = (existingActions) + ',' + newActions;
        } else {
            updatedActions = existingActions;
        }
    } else if (newActions?.length) {
        updatedActions = newActions;
    }
    return updatedActions;
}

function evaluateAccessRoles(roles = '') {
    if (roles) {
        roles = roles.split(',');
        return roles.some((roleName) => gs.hasRole(roleName));
    } else {
        return true;
    }
}

function updateFormFieldsMapper(mainObject = {}, variableSet) {
    const {
        props = {}, skill_id
    } = variableSet;
    if (props.wwna_component_id && String(props.is_active) === "true") {
        if (!mainObject.formfieldsMapper[props.table]) {
            mainObject.formfieldsMapper[props.table] = {};
            mainObject.formFieldsSkillMapping[props.table] = {};
        }
        if (props.table === props.wwna_component_id) {
            props.configured_columns.forEach(column => {
                if (column) {
                    mainObject.formfieldsMapper[props.table][column] = props.is_active;
                    mainObject.formFieldsSkillMapping[props.table][column] = {
                        active: props.is_active,
                        skill_id: skill_id
                    };
                }
            });
        } else {
            mainObject.formfieldsMapper[props.table][props.wwna_component_id] = props.is_active;
            mainObject.formFieldsSkillMapping[props.table][props.wwna_component_id] = {
                active: props.is_active,
                skill_id: skill_id
            };
        }
    }
    return mainObject;
}

function addVarSetForExtendedTable(configObj, currentTable) {
    // NOTE: These logic may needs to be changed whenever we enable fetching the parent and child configs together
    if (!currentTable || !configObj) {
        return configObj;
    }
    const tableHierarchy = new GlideTableHierarchy(currentTable).getHierarchy();
    let varSetIdx = -1;
    let hierarchyIdx = -1;
    let isAlreadyExist = false;
    if (configObj?.variable_sets?.length) {
        for (let i = 0; i < configObj.variable_sets.length; i++) {
            const varSet = configObj.variable_sets[i];

            if (
                varSet.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID && String(varSet.props.enable_extended_tables) === "true"
            ) {
                const foundHierarchyIdx = tableHierarchy.indexOf(varSet.props.table);

                if (foundHierarchyIdx > -1) {
                    if (foundHierarchyIdx === 0) {
                        isAlreadyExist = true;
                        break;
                    } else if (hierarchyIdx === -1 || foundHierarchyIdx < hierarchyIdx) {
                        varSetIdx = i;
                        hierarchyIdx = foundHierarchyIdx;
                    }
                }
            }
        }

        if (!isAlreadyExist && varSetIdx !== -1) {
            var matchingTable = configObj.variable_sets[varSetIdx].props.table;

            var matchingVarSets = [];
            configObj.variable_sets.forEach(varSet => {
                if (varSet.props.table === matchingTable && String(varSet.props.enable_extended_tables) === "true") {
                    var obj = JSON.parse(JSON.stringify(varSet));
                    obj.props.table = currentTable;
                    // For forms WWNA varset prop table is expected to be same as the wwna_component_id
                    // So even on clone for currentTable we will ensure to maintain the same contract
                    if (varSet.props.table === varSet.props.wwna_component_id) {
                        obj.props.wwna_component_id = currentTable;
                    }
                    matchingVarSets.push(obj);
                }
            });

            configObj.variable_sets = configObj.variable_sets.concat(matchingVarSets);
        }
    }


    return configObj;
}

function addOrRemoveKeyWord(existingDecorators = '', currentDecorator = '', actionType) {
    existingDecorators = existingDecorators.split(';');
    let indexOfCurrentDecorator = existingDecorators.indexOf(currentDecorator);
    if (indexOfCurrentDecorator === -1 && actionType === sn_wwna.WWNAConstants.decoratorActionType.create) {
        existingDecorators = [currentDecorator, ...existingDecorators];
    } else if (indexOfCurrentDecorator > -1 && actionType === sn_wwna.WWNAConstants.decoratorActionType.remove) {
        existingDecorators.splice(indexOfCurrentDecorator, 1);
    }
    return existingDecorators.join(';');
}

function createOrDeleteFieldDecorator(skillConfigId, tableColString, actionType, originalTableName, isSkillConfigActive) {
    try {
        let {
            tableName,
            columnName
        } = getTableAndColumnName(tableColString);
        originalTableName = originalTableName || tableName;
        let utils = new sn_wwna.WWNAUtils();
        let macroName = utils.getMacroName(originalTableName, columnName);
        let componentId = utils.getWWNAComponentId(originalTableName, columnName);
        const fieldDecorationsAttribute = "field_decorations";
        let macroResult;
        var globalWWNAUtils = new global.WWNAGlobalUtils();
        if (actionType === 'create') {
            macroResult = globalWWNAUtils.createMacro({
                name: macroName,
                scoped_name: macroName,
                active: isSkillConfigActive ? true : false,
                category: 'general',
                xml: sn_wwna.WWNAConstants.getXmlScript(skillConfigId, tableName, columnName, componentId)
            });
        } else {
            macroResult = globalWWNAUtils.deleteMacro(macroName);
        }

        let origFieldDecorations = globalWWNAUtils.getAttribute(originalTableName, columnName, fieldDecorationsAttribute) || '';
        let newFieldDecorations = origFieldDecorations;
        if (!newFieldDecorations && actionType === sn_wwna.WWNAConstants.decoratorActionType.create)
            newFieldDecorations = macroName;
        else
            newFieldDecorations = addOrRemoveKeyWord(newFieldDecorations, macroName, actionType);


        if (newFieldDecorations !== origFieldDecorations)
            globalWWNAUtils.setOrRemoveAttribute(originalTableName, columnName, fieldDecorationsAttribute, newFieldDecorations);

        return {
            success: true
        };
    } catch (err) {
        this.logger.error(`NACM createOrDeleteFieldDecorator Error: ${err.message}`);
        return {
            success: false
        };
    }
}

function getTableAndColumnName(tableColString) {
    const [tableName, columnName] = tableColString.split('.');
    return {
        tableName: tableName || '',
        columnName: columnName || ''
    };
}

WWNAUtils.prototype = {
    initialize: function() {
        this.logger = new sn_wwna.WWNALogger();
        this.recordGr = null;
        this.domainGr = null;
        this.actionIdsSet = new Set();
        this.ACTION_KEYS = ['refine_actions', 'call_to_action', 'open_prompt_action', 'preset_actions', 'default_preset_action'];
        this.utils = null;
        this.isDomainSeprated = global.JSUtil.toBoolean(gs.getProperty('glide.sys.domain.use_record_domain_for_processes'));
        this.disableDuplicateVarSetMerge = global.JSUtil.toBoolean(gs.getProperty('sn_wwna.disable_duplicate_var_set_merge', false));
        this.skillToSkillConfigMap = {};
        this.naaWwnaUtils = null;
    },


    setRecordGr: function(table, recordId, skillId, utils) {
        var recordGr, domainGr;
        try {
            recordGr = new GlideRecord(table);
            recordGr.get(recordId);
            if (skillId) {
                domainGr = utils?.getDomainGr();
            }
        } catch (error) {
            this.logger.error("WWNA: NACM Skill Config error: " + error.message);

        }
        this.recordGr = recordGr || this.recordGr;
        this.domainGr = domainGr || this.domainGr;
    },
    fetchNACMSkillConfiguration: function(skill_id, record_table_name, record_sys_id, skill_table_name, skill_config_id, wwnaComponentIdsToExclude = []) {
        if (!skill_id && !skill_config_id) {
            this.logger.error("WWNA: FETCH NACM Skill Config is Missing Query Parameter skill_id and skill_config_id");
            return null;
        }

        if (!wwnaComponentIdsToExclude) {
            wwnaComponentIdsToExclude = [];
        }
        var skillFilter = {};
        let isNewConfig = false;
        let isParentSkillConfigExist, isNacmSkillConfigExist;
        skill_table_name = skill_table_name || "sys_one_extend_capability";
        try {

            this.utils = new sn_wwna.WWNAConfigImpl(record_table_name, record_sys_id, skill_id);
            this.logger.info("WWNA: Skill Config API Query Parameters: " + JSON.stringify({
                skill_id,
                record_table_name,
                record_sys_id,
                skill_table_name,
                skill_config_id
            }));

            const isBUSkillConfigMergeSkipped = this.utils?.shouldDisableMerge();

            var nacmSkillConfig, parentSkillConfig, skillConfigObj, tempConfig = {
                isErrored: true
            };


            if (this.utils?.getFilters) {
                skillFilter = this.utils.getFilters() || {};
                this.logger.info("WWNA: Skill Config API skillFilters: " + JSON.stringify(skillFilter));
            }

            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();

            var skillConfigExists = false;

            if (this.isDomainSeprated && skill_id) {
                skillConfigExists = nowAssistSkillConfig.doesSkillConfigExistForRecord(skill_id, skillFilter, false);
                if (skillConfigExists) {
                    this.setRecordGr(record_table_name, record_sys_id, skill_id, this.utils);
                }
            }

            var actions = {};
            if (this.utils?.getSkillConfigObj) {
                tempConfig = this.utils.getSkillConfigObj();
            }
            this.naaWwnaUtils = new sn_wwna.NAAWWNAUtils();
            if (tempConfig?.isErrored) {
                parentSkillConfig = this.fetchAllSkillConfigsForSkillIdAndFilter(skill_id, skillFilter, record_table_name, record_sys_id, skill_table_name, skill_config_id, wwnaComponentIdsToExclude, false, true);
                isParentSkillConfigExist = !!parentSkillConfig?.variable_sets?.length;
                if (isBUSkillConfigMergeSkipped && isParentSkillConfigExist) {
                    let tempComponentIdsToExclude = new Set();
                    parentSkillConfig.variable_sets.forEach((varSet) => {
                        if (varSet.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID && varSet.props?.configured_columns?.length) {
                            varSet.props.configured_columns.split(',').forEach((column) => tempComponentIdsToExclude.add(column));
                        }
                    });
                    wwnaComponentIdsToExclude = wwnaComponentIdsToExclude.concat([...tempComponentIdsToExclude]);
                }
                this.logger.info('NACM/WWNA: Parent Skill Config Exist');
                let defaultFilter = {
                    table: record_table_name
                };
                if (
                    !this.disableDuplicateVarSetMerge && skill_id && !skill_config_id && (
                        skill_id !== sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID ||
                        defaultFilter.table !== skillFilter?.table
                    )
                ) {
                    this.logger.info('NACM/WWNA: Fetching NACM Skill Configurations as well');

                    let additionalConfig = this.fetchAllSkillConfigsForSkillIdAndFilter(sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID, defaultFilter, record_table_name, record_sys_id, skill_table_name, skill_config_id, wwnaComponentIdsToExclude, true);
                    let isAdditionalConfigPresent = !!additionalConfig?.variable_sets?.length;
                    if (!isParentSkillConfigExist && isAdditionalConfigPresent) {

                        parentSkillConfig = additionalConfig;
                        isParentSkillConfigExist = true;
                    } else if (isParentSkillConfigExist && isAdditionalConfigPresent) {
                        parentSkillConfig.variable_sets = parentSkillConfig.variable_sets.concat(additionalConfig.variable_sets);
                    }
                }
                if (skill_config_id) {
                    nacmSkillConfig = this.fetchSkillConfigByIds([skill_config_id], wwnaComponentIdsToExclude, record_table_name, record_sys_id, null, true, skill_id);
                }
            } else {
                parentSkillConfig = tempConfig;
                if (parentSkillConfig?.skipFetchingConfiguration) {
                    // This is to prevent any further operations. For example, in the case of a CRR implementation function, a role check can be performed, based on which this flag can be set to either true or false
                    parentSkillConfig.isInProductRolesSatisfied = evaluateAccessRoles(parentSkillConfig.in_product_roles);
                    parentSkillConfig.isInMobileRolesSatisfied = evaluateAccessRoles(parentSkillConfig.in_mobile_roles);

                    parentSkillConfig = addVarSetForExtendedTable(parentSkillConfig, record_table_name);

                    return parentSkillConfig;
                }
                if (parentSkillConfig?.sys_id) {
                    isParentSkillConfigExist = true;
                    this.updateSkillToSkillConfigMap([parentSkillConfig?.sys_id]);
                }

                parentSkillConfig = this._formatNacmConfig(parentSkillConfig, wwnaComponentIdsToExclude, true);

            }

            if (nacmSkillConfig && nacmSkillConfig?.variable_sets?.length) {
                isNacmSkillConfigExist = true;
            } else {
                nacmSkillConfig = Object.assign((nacmSkillConfig || {}), {
                    variable_sets: []
                });
            }

            if (!isParentSkillConfigExist && isNacmSkillConfigExist) {
                parentSkillConfig = JSON.parse(JSON.stringify(nacmSkillConfig));
                nacmSkillConfig = {
                    variable_sets: []
                };
            }

            // If nacmSkillConfig is not present we still want to send the parentSkillConfig
            // If parentSkillConfig is not present we still want to send the nacmSkillConfig
            // If both are not present then we can log this error
            if (!isNacmSkillConfigExist && !isParentSkillConfigExist) {
                this.logger.error("WWNA: Skill Config & Parent Skill Config Record Not Found");
                return null;
            }

            let skillDetailsObj = {
                skill_name: '',
                skill_description: ''
            };
            if (skill_id) {
                var skillGr = new GlideRecord(skill_table_name);
                skillGr.get(skill_id);
                skillDetailsObj['skill_name'] = skillGr.getValue('name');
                skillDetailsObj['skill_description'] = skillGr.getValue("description");
                skillDetailsObj['skill_id'] = skillGr.getUniqueValue();
            }
            skill_config_id = nacmSkillConfig.sys_id || parentSkillConfig.sys_id;
            let nacmSkillDetailsObj = this.getSkillDetails(skill_config_id);
            parentSkillConfig = {
                ...parentSkillConfig,
                ...skillDetailsObj
            };

            if (nacmSkillDetailsObj.skill_id && nacmSkillConfig.sys_id && this.skillToSkillConfigMap[nacmSkillConfig.sys_id]) {
                parentSkillConfig.nacm_skill_id = nacmSkillDetailsObj.skill_id;
            } else {
                parentSkillConfig.nacm_skill_id = nacmSkillDetailsObj.skill_id = sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID;
            }

            parentSkillConfig.skill_name = parentSkillConfig.skill_name || nacmSkillDetailsObj.skill_name;
            parentSkillConfig.skill_description = parentSkillConfig.skill_description || nacmSkillDetailsObj.skill_description;
            parentSkillConfig.skill_table_name = skill_table_name;
            parentSkillConfig.skill_config_id = skill_config_id;
            parentSkillConfig.sys_id = parentSkillConfig.sys_id || nacmSkillConfig.sys_id;
            parentSkillConfig.isNewConfig = (parentSkillConfig.isNewConfig || nacmSkillConfig.isNewConfig);
            if ((!skill_id && this.skillToSkillConfigMap[nacmSkillConfig.sys_id]) || !parentSkillConfig.hasOwnProperty('in_product_active')) {
                parentSkillConfig.in_product_active = nacmSkillConfig.in_product_active;
            }

            // For maint only users, the returned sysId is like: <first_name>@<last_name>@snc. The SysId is used to construct amb Channel which doesn't allow the special character `@`. Hence removing it before sending the response back.
            parentSkillConfig.user_sys_id = gs.getUserID().replace("@", "");
            parentSkillConfig.variable_sets = [...parentSkillConfig.variable_sets, ...nacmSkillConfig.variable_sets];

            if (!this.disableDuplicateVarSetMerge) {
                parentSkillConfig = this._mergeDuplicateVarSets(parentSkillConfig, record_table_name, wwnaComponentIdsToExclude);
            }


            parentSkillConfig = addVarSetForExtendedTable(parentSkillConfig, record_table_name);
            const actionIdsToFetch = [...this.actionIdsSet];
            var inputsForActionVisibilityScript = {};
            if (actionIdsToFetch.length) {
                inputsForActionVisibilityScript = {
                    skillConfig: parentSkillConfig,
                    skillId: skill_id,
                    skillConfigId: skill_config_id,
                    recordTableName: record_table_name,
                    recordSysId: record_sys_id,
                    recordGr: this.recordGr
                };
                actions = this._fetchActions(record_table_name, record_sys_id, actionIdsToFetch, inputsForActionVisibilityScript);
            }
            parentSkillConfig.formfieldsMapper = {};
            parentSkillConfig.formFieldsSkillMapping = {};
            parentSkillConfig.variable_sets = parentSkillConfig.variable_sets.map((variableSet) => {
                return this._processVariableSet(variableSet, actions, parentSkillConfig);
            });
            parentSkillConfig.variable_sets.sort((a, b) => Number(a.order) - Number(b.order));
            this.logger.info("WWNA: Skill Config API formatted nacmSkillConfigurations: " + JSON.stringify(parentSkillConfig));

            return parentSkillConfig;

        } catch (error) {
            this.logger.error("WWNA: NACM Skill Config error: " + error.message);
            return null;
        }
    },

    _preProcessSkillConfigObject: function(data, overrideVariables = {}, componentIdsToExclude = [], isNewConfig = false) {

        var newVariableSets = data.variable_sets.reduce((acc, variableSet) => {
            let newOverrideSets = JSON.parse(JSON.stringify(variableSet.override_sets));
            variableSet.override_sets.forEach((overrideSet, index) => {
                if (overrideSet.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                    let shouldInclude = true;
                    if ((componentIdsToExclude && componentIdsToExclude.length && overrideSet.props?.wwna_component_id && componentIdsToExclude.includes(overrideSet.props?.wwna_component_id)) || String(overrideSet.props?.is_active) === "false") {
                        shouldInclude = false;
                    }
                    if (shouldInclude) {
                        overrideSet.isNewConfig = isNewConfig;
                        overrideSet.skillConfigId = data.sys_id;
                        overrideSet.skill_id = data.skill_id;
                        overrideSet.skillConfigOrder = data.order;
                        overrideSet.skillConfigSysUpdatedOn = data.sys_updated_on;
                        overrideSet.props = Object.assign(overrideSet.props, overrideVariables);
                        this.addActionsToTheSet(overrideSet);
                        acc.push(overrideSet);
                        newOverrideSets.splice(index, 1);
                    }
                }
            });
            variableSet.override_sets = newOverrideSets;
            let shouldIncludeParentVariableSet = true;
            if (variableSet.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID && ((isNewConfig && variableSet.name === 'Configure experience') || (String(variableSet.props?.is_active) === "false"))) {
                shouldIncludeParentVariableSet = false;
            }
            if (shouldIncludeParentVariableSet) {
                variableSet.isNewConfig = isNewConfig;
                variableSet.skill_id = data.skill_id;
                variableSet.skillConfigId = data.sys_id;
                variableSet.skillConfigOrder = data.order;
                variableSet.skillConfigSysUpdatedOn = data.sys_updated_on;
                if (variableSet.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                    variableSet.props = Object.assign(variableSet.props, overrideVariables);
                }
                this.addActionsToTheSet(variableSet);
                acc.push(variableSet);
            }
            return acc;
        }, []);

        data.variable_sets = newVariableSets;

        return data;
    },
    addActionsToTheSet: function(variableSet = {}) {
        if (!variableSet || (variableSet && variableSet.config_type !==
                sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID)) {
            return;
        }
        this.ACTION_KEYS.forEach((actionKey) => {
            if (variableSet.props[actionKey]?.length) {
                const listOfActions = typeof variableSet.props[actionKey] === 'string' ? variableSet.props[actionKey].split(',') : variableSet.props[actionKey];
                listOfActions.forEach((actionId) => this.actionIdsSet.add(actionId));
            }
        });
    },
    fetchSkillConfigByIds: function(skillConfigIds = [], wwnaComponentIdsToExclude, record_table_name, record_sys_id, skill_config_id, skipSkillConfigIdCheck = false, skill_id) {
        var skillConfigObj = null;
        try {
            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            this.updateSkillToSkillConfigMap(skillConfigIds);
            var isNewConfig = false;
            if (this.isDomainSeprated && !this.recordGr) {
                this.setRecordGr(record_table_name, record_sys_id);
            }
            var nacmConfigs = nowAssistSkillConfig.getSkillConfigurations ? nowAssistSkillConfig.getSkillConfigurations(skillConfigIds, this.domainGr || this.recordGr) : this.fetchSkillConfigurations(skillConfigIds, this.domainGr || this.recordGr);

            nacmConfigs.forEach((nacmConfig) => {
                nacmConfig = this._formatNacmConfig(nacmConfig, wwnaComponentIdsToExclude, true, false, skill_id);
                if (!checkIfSkillConfigIsValid(nacmConfig, skill_config_id, skipSkillConfigIdCheck)) {
                    nacmConfig = null;
                }
                if (nacmConfig) {
                    if (!isNewConfig && nacmConfig.isNewConfig) {
                        isNewConfig = true;
                    }
                    if (!skillConfigObj) {
                        skillConfigObj = nacmConfig;
                    } else {
                        skillConfigObj.variable_sets = [...skillConfigObj.variable_sets, ...(nacmConfig.variable_sets || [])];
                    }
                }
            });

            skillConfigObj = skillConfigObj || {
                variable_sets: []
            };
            skillConfigObj.isNewConfig = isNewConfig;
            return (skillConfigObj);
        } catch (err) {
            this.logger('WWNA: Error while fetching Skill Config By Ids: ' + err?.message);
            skillConfigObj = skillConfigObj || {
                variable_sets: []
            };
            return skillConfigObj;
        }
    },
    _formatNacmConfig(nacmConfig, wwnaComponentIdsToExclude, filterVariableSet = true, fetchAndCheckWwnaActive = false, skill_id) {
        let isNewConfig = false;
        let generalDetailsVariableObj = null;
        if (!nacmConfig) {
            nacmConfig = {
                variable_sets: []
            };
        } else if (nacmConfig && !nacmConfig.variable_sets) {
            nacmConfig.variable_sets = [];
        }

        if (this.skillToSkillConfigMap[nacmConfig.sys_id]) {
            isNewConfig = true;
        }

        if (nacmConfig.variable_sets.length) {
            nacmConfig.variable_sets = nacmConfig.variable_sets.filter((variableSetObj) => {
                let filterResult = true;
                if (variableSetObj.config_type !== sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                    if (variableSetObj.config_type === sn_wwna.WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID) {
                        generalDetailsVariableObj = JSON.parse(JSON.stringify(variableSetObj));
                    }
                    filterResult = false;
                }
                return filterVariableSet ? filterResult : true;
            });


            if (generalDetailsVariableObj?.props?.sys_id) {
                // this is to avoid sys_id of general Details getting override on the other var set
                delete generalDetailsVariableObj.props.sys_id;
            }
            nacmConfig.skill_id = nacmConfig.skill_id || skill_id;
            nacmConfig = this._preProcessSkillConfigObject(nacmConfig, generalDetailsVariableObj?.props || {}, wwnaComponentIdsToExclude, isNewConfig);
            nacmConfig.isNewConfig = isNewConfig;
            // only checkWWNAActive for Parent Skill Id
            let isWWNAActive = fetchAndCheckWwnaActive && this.utils && this.utils.isWWNAActive ? this.utils.isWWNAActive(nacmConfig) : null;
            if (gs.nil(isWWNAActive)) {
                isWWNAActive = true;
            }
            nacmConfig.is_wwna_active = isWWNAActive;

            let additionalConfig = fetchAndCheckWwnaActive && this.utils && this.utils.getAdditionalConfig ? this.utils.getAdditionalConfig(nacmConfig) : null;
            nacmConfig.additional_config = additionalConfig;
            nacmConfig.isInProductRolesSatisfied = evaluateAccessRoles(nacmConfig.in_product_roles);
            nacmConfig.isInMobileRolesSatisfied = evaluateAccessRoles(nacmConfig.in_mobile_roles);
        }
        return nacmConfig;
    },
    _processVariableSet: function(variableSet = {}, actions = {}, mainObject = {}) {
        try {
            if (variableSet.config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID) {
                var props = variableSet.props;
                props.configured_columns = (props.configured_columns || "").split(",");
                props.feedbackProps = {};
                if (props.enable_granular_feedback) {
                    props.feedbackProps.positiveFeedback = this._formatFeedbackProps(props, 'positive_feedback');
                    props.feedbackProps.negativeFeedback = this._formatFeedbackProps(props, 'negative_feedback');
                    delete props?.positive_feedback;
                    delete props?.negative_feedback;
                }
                // For handling i18n
                props.timeout_error_message = this._getMessageLang(props.timeout_error_message);
                props.recommendation_dialog_props = this._translateRecommendationDialogProps(props.recommendation_dialog_props);
                props.button_props = this._translateButtonProps(props.button_props);
                props.open_prompt_config = this._translateOpenPromptProps(props.open_prompt_config);
                this.ACTION_KEYS.forEach((actionKey) => {
                    props[actionKey] = this._replaceActions(props[actionKey] || "", actions, actionKey === 'default_preset_action' || actionKey === 'open_prompt_action' ? true : false);
                });
                variableSet.props = props;
                updateFormFieldsMapper(mainObject, variableSet);
            }
            return variableSet;
        } catch (err) {
            this.logger.error(`WWNA: Error while process Variable Set - ${variableSet?.name} Error : ${err?.message} `);
            return variableSet;
        }
    },
    _formatFeedbackProps: function(props, key) {
        if (props[key]) {
            props[key] = typeof props[key] === 'object' ? props[key] : typeof props[key] === 'string' && props[key].length > 2 ? JSON.parse(props[key]) : {};

            if (props[key].heading?.length) {
                props[key].heading = this._getMessageLang(props[key].heading);
            }

            if (props[key].items?.length) {
                props[key].items = typeof props[key].items === 'object' ? props[key].items : typeof props[key].items === 'string' && props[key].items.length > 2 ? JSON.parse(props[key].items) : [];

                props[key].items = props[key].items.map(item => {
                    if (item.type === "checklist" || item.type === "radio") {
                        if (Array.isArray(item.value)) {
                            item.value = item.value.map(v => ({
                                ...v,
                                label: this._getMessageLang(v.label)
                            }));
                        }
                    } else if (item.type === "textarea") {
                        item.value = this._getMessageLang(item.value);
                    }
                    return item;
                });
            }

            return props[key];
        } else {
            return {};
        }
    },
    _translateRecommendationDialogProps: function(strObj) {
        try {
            var obj = strObj ? (typeof strObj === 'string' ? JSON.parse(strObj) : strObj) : {};

            if (obj.footerLabel) {
                obj.footerLabel = this._getMessageLang(obj.footerLabel);
            }
            if (obj.additionalInfoTooltip) {
                obj.additionalInfoTooltip = this._getMessageLang(obj.additionalInfoTooltip);
            }

            if (obj.insertButtonLabel) {
                obj.insertButtonLabel = this._getMessageLang(obj.insertButtonLabel);
            }

            if (obj.primaryCTATooltip) {
                obj.primaryCTATooltip = this._getMessageLang(obj.primaryCTATooltip);
            }

            if (obj.headerInitialLabel) {
                obj.headerInitialLabel = this._getMessageLang(obj.headerInitialLabel);
            }

            if (obj.headerLoadingLabel) {
                obj.headerLoadingLabel = (obj.headerLoadingLabel.split(",").map(item => (
                    this._getMessageLang(item)
                ))).join(",");
            }

            if (obj.headerLoadedLabel) {
                obj.headerLoadedLabel = this._getMessageLang(obj.headerLoadedLabel);
            }

            return JSON.stringify(obj);
        } catch (err) {
            return strObj;
        }
    },

    _translateButtonProps: function(strObj) {
        try {
            var obj = strObj ? (typeof strObj === 'string' ? JSON.parse(strObj) : strObj) : {};

            if (obj.label) {
                obj.label = this._getMessageLang(obj.label);
            }
            if (obj.tooltipContent) {
                obj.tooltipContent = this._getMessageLang(obj.tooltipContent);
            }
            if (obj.openPromptInputPlaceholder) {
                obj.openPromptInputPlaceholder = this._getMessageLang(obj.openPromptInputPlaceholder);
            }
            if (obj.additionalInfoOnTrigger) {
                obj.additionalInfoOnTrigger = this._getMessageLang(obj.additionalInfoOnTrigger);
            }

            return JSON.stringify(obj);
        } catch (err) {
            return strObj;
        }
    },

    _translateOpenPromptProps: function(strObj) {
        try {
            var obj = JSON.parse(strObj);

            if (obj.openPromptIntitalValue) {
                obj.openPromptIntitalValue = this._getMessageLang(obj.openPromptIntitalValue);
            }
            if (obj.openPromptInputPlaceholder) {
                obj.openPromptInputPlaceholder = this._getMessageLang(obj.openPromptInputPlaceholder);
            }

            return JSON.stringify(obj);
        } catch (err) {
            return strObj;
        }
    },


    _getMessageLang: function(key) {
        return gs.getMessageLang(key, gs.getSession().getLanguage());
    },


    /**
     * Gets the Root table name other than sys_metadata from glide hierarchy
     * 
     * @return {string} Root table name other than sys_metadata.
     **/
    _getRootTableFromHierarchy(table, fetchAllTables = false) {
        var tables = new GlideTableHierarchy(table).getTables();
        var tableList;

        // Check if the last element is "sys_metadata"
        if (fetchAllTables) {
            tableList = tables || [];
        } else {
            if (tables[tables.length - 1] === "sys_metadata") {
                // Pick the second-last element
                tableList = tables[tables.length - 2];
            } else {
                // Pick the last element
                tableList = tables[tables.length - 1];
            }
        }
        return tableList;
    },
    _fetchActions: function(table, sysId, sysIdsToFetch = [], inputForVisibilityScript = {}) {
        try {
            if (!table) {
                return {};
            }
            let actions = [];
            actions = sn_snippets.QuickAction.loadNacmActions(table, sysId, {
                includeParentTables: true
            }, (sysIdsToFetch || []));
            actions = actions && typeof actions === 'string' ? JSON.parse(actions) : (actions || []);
            return actions.reduce((actionsGroupedById, currentAction) => {
                if (this.shouldShowAction(currentAction, inputForVisibilityScript)) {
                    actionsGroupedById[currentAction.sysId] = {
                        ...currentAction,
                        name: this._getMessageLang(currentAction.name),
                        actionGroup: this._getMessageLang(currentAction.actionGroup)
                    };
                }
                return actionsGroupedById;
            }, {});
        } catch (err) {
            this.logger.error(`NACM: Unable to fetch Actions for Table: ${table} Error: ${err?.message}`);
            return {};
        }
    },
    _replaceActions: function(actionIdsStr = '', actionsGroupedById = {}, isSingleAction = false) {
        var actionIds = [...new Set((actionIdsStr || '').split(','))].filter(item => item);
        const self = this;
        if (!actionsGroupedById) {
            actionsGroupedById = {};
        }
        if (actionIds.length) {
            if (isSingleAction) {
                var actionId = actionIds[0] || "";
                let defaultActionObj = actionsGroupedById[actionId] || {};
                return defaultActionObj;
            } else {
                let newActionsArr = [];
                actionIds.forEach((actionId) => {
                    let tempActionObj = actionsGroupedById[actionId] || null;
                    if (tempActionObj) {
                        newActionsArr.push(tempActionObj);
                    }
                });
                return newActionsArr;
            }
        } else {
            return isSingleAction ? {} : [];
        }
    },
    _replaceActionsByOrder: function(actionIdsStr, actionsArr) {
        var actionIds = actionIdsStr.split(',');

        return actionIds
            .map(actionId => actionsArr.find(item => item.sysId === actionId)).filter(action => action !== undefined);
    },

    invokeNACMAction: function(table, sysId, message, context) {
        try {
            var wwna_table = sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS;
            return sn_snippets.QuickAction.invokeAction(table, sysId, message, context, wwna_table);
        } catch (error) {
            this.logger.error("WWNA: Skill Config API error: " + error.message);
            return null;
        }
    },
    createAndDeleteFieldDecorators: function(skillConfigId, recordsToCreate, recordsToDelete, originalTableName) {
        try {
            var utils = new sn_nowassist_admin.NowAssistSkillConfig();
            var skillConfigRecord = utils.getSkillConfiguration(skillConfigId);
            let generalDetailsVarSet;
            let variableSetLength = skillConfigRecord.variable_sets?.length || 0;
            if (!originalTableName && variableSetLength) {
                for (let i = 0; i < variableSetLength; i++) {
                    if (skillConfigRecord.variable_sets[i].config_type === sn_wwna.WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID) {
                        generalDetailsVarSet = JSON.parse(JSON.stringify(skillConfigRecord.variable_sets[i]));
                        break;
                    }
                }

                if (generalDetailsVarSet?.props?.table) {
                    originalTableName = generalDetailsVarSet.props.table;
                }
            }

            let isSkillConfigActive = ['true', '1'].includes(String(skillConfigRecord?.active)) ? true : false;
            if (recordsToCreate && Object.keys(recordsToCreate).length) {
                Object.keys(recordsToCreate).forEach((columnName) => {
                    createOrDeleteFieldDecorator(skillConfigId, columnName, sn_wwna.WWNAConstants.decoratorActionType.create, originalTableName, isSkillConfigActive);
                });
            }

            if (recordsToDelete && Object.keys(recordsToDelete).length) {
                Object.keys(recordsToDelete).forEach((columnName) => {
                    createOrDeleteFieldDecorator(skillConfigId, columnName, sn_wwna.WWNAConstants.decoratorActionType.remove, originalTableName);
                });
            }
            return {
                success: true
            };
        } catch (err) {
            this.logger.error(`NACM parent createAndDeleteFieldDecorators Error: ${err.message}`);
            return {
                success: false
            };
        }
    },
    getSkillDetails: function(skillConfigId) {
        var skillConfigGr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.SKILL_CONFIG);
        skillConfigGr.get(skillConfigId);
        let skillId = skillConfigGr.getValue('skill_id');
        let result = {
            skill_name: '',
            skill_description: '',
            skill_id: ''
        };
        if (skillId) {
            let skillGr = skillConfigGr.skill_id.getRefRecord();
            result['skill_name'] = skillGr.getValue('name');
            result['skill_description'] = skillGr.getValue('description');
            result['skill_id'] = skillGr.getUniqueValue();
        }
        return result;
    },
    updateMacro: function(skillConfigId, active) {
        if (!skillConfigId) {
            return;
        }
        var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
        var skillConfig = nowAssistSkillConfig.getSkillConfiguration(skillConfigId, null);
        let generalDetailsVarSet, actionConfigVarSet;
        if (skillConfig?.variable_sets?.length) {
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
            if (generalDetailsVarSet?.props?.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE && actionConfigVarSet?.override_sets?.length) {
                let macroNames = [];
                actionConfigVarSet.override_sets.forEach((actionConfigObj) => {
                    if (actionConfigObj.title) {
                        macroNames.push(`nacm-${actionConfigObj.title}`);
                    }
                });

                if (macroNames.length) {
                    var globalWWNAUtils = new global.WWNAGlobalUtils();
                    globalWWNAUtils.updateMacro({
                        name: {
                            operator: 'IN',
                            value: macroNames
                        }
                    }, {
                        active: !!active
                    });
                }
            }
        }
    },
    getWWNAComponentId: function(tableName, columnName) {
        return `${this.getTruncatedTableName(tableName)}.${columnName}`;
    },
    getTruncatedTableName: function(tableName) {
        var newName = '';
        if (tableName.length < 41) {
            return tableName;
        }
        tableName = tableName.split('_');
        var tableNameLength = tableName.length;
        tableName.forEach(function(current, index) {
            if (index === 0) {
                newName = current;
            } else if (index >= (tableNameLength - 1)) {
                let newLastCurrent = current;
                let tempLength = current.length;
                if (tempLength >= 32) {
                    // if last word length is more than 32 then truncate it to 15 chars by taking 5 chars from start, middle & end
                    newLastCurrent = (current.substr(0, 5) + current.substr(parseInt(tempLength / 2), 5) + current.substr(tempLength - 5));
                }
                newName += ('_' + newLastCurrent);
            } else {
                if (index === 1) {
                    newName += '_';
                }
                newName += (current.charAt(0));
            }
        });
        return newName;
    },
    getMacroName: function(tableName, columnName) {
        return `nacm-${this.getTruncatedTableName(tableName)}.${columnName}`;
    },

    nacmGuardianErrorHandler: function(capabilityResponse) {
        if (!capabilityResponse.status == "error" || !capabilityResponse.errorCode) {
            return null;
        }
        var errorData = sn_wwna.WWNAConstants.NACM_GUARDIAN_ERROR_MAPPER[capabilityResponse.errorCode];
        if (!errorData) {
            return null;
        }
        if (capabilityResponse.errorCode == 300000 && errorData.conditions) {
            var guardianErrorCodes = capabilityResponse.guardian.errorCodes;
            for (var i = 0; i < errorData.conditions.length; i++) {
                if (errorData.conditions[i].check(guardianErrorCodes)) {
                    return errorData.conditions[i].message;
                }
            }
            return errorData.defaultMessage;
        }
        return errorData.message || null;
    },

    getTableName: function(tableName, skillConfigId, skillConfigVarSetId) {
        if (!tableName && (skillConfigId || skillConfigVarSetId)) {
            if (!skillConfigId && skillConfigVarSetId) {
                let varSetGr = new GlideRecord('sn_nowassist_skill_config_var_set');
                varSetGr.get(skillConfigVarSetId);
                skillConfigId = varSetGr.getValue('skill_config');
            }
            var gr = new GlideRecord('sn_nowassist_skill_config_var_set');
            gr.addQuery('skill_config', skillConfigId);
            gr.addQuery('config_type', sn_wwna.WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID);
            gr.query();
            if (gr.next()) {
                tableName = gr.vars['table'] || tableName;
            }
        }
        return tableName;
    },

    getWordCount: function(str) {
        const thaiRegex = /[\u0E00-\u0E7F]+/g; // Thai words
        const chineseRegex = /[\u4E00-\u9FFF]+/g; // Chinese words
        const japaneseRegex = /[\u3040-\u30FF\u31F0-\u31FF]+/g; // Japanese words

        // Match Thai, Chinese, and Japanese words (not just characters)
        const thaiWords = str.match(thaiRegex) || [];
        const chineseWords = str.match(chineseRegex) || [];
        const japaneseWords = str.match(japaneseRegex) || [];

        // Count words in non-Asian scripts (splitting by whitespace)
        const otherWords = str.replace(/[\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u30FF\u31F0-\u31FF]/g, "").trim();
        const otherWordCount = otherWords ? otherWords.split(/\s+/).length : 0;

        return thaiWords.length + chineseWords.length + japaneseWords.length + otherWordCount;
    },
    formatCapabilityResponse: function(outputs, additionalDataToBeAdded) {
        try {
            let parsedResponse = JSON.parse(outputs.result.response);
            let parsedModelOutput = typeof parsedResponse.model_output === 'string' ? JSON.parse(parsedResponse.model_output) : (parsedResponse.model_output || null);
            let resp = parsedModelOutput?.response ? parsedModelOutput.response : null;
            if (resp && parsedModelOutput?.citations) {
                resp = JSON.stringify({
                    response: resp,
                    citations: parsedModelOutput.citations
                });
            }
            outputs.result.response = resp ? resp : additionalDataToBeAdded.followUpQuestion ? '' : sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE;
            outputs.result = Object.assign(outputs.result, additionalDataToBeAdded);
        } catch (err) {
            this.logger.error('WWNA: Error in formatting the capability Response: ' + err?.message);
        }
        return outputs;
    },
    shouldShowAction: function(actionObj, scriptInputs) {
        try {
            const newScriptInputs = Object.assign({}, {
                actionDetails: JSON.parse(JSON.stringify(actionObj))
            }, scriptInputs);
            const nacmActionTableName = sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS;
            if (actionObj && String(actionObj.useAdvancedCondition) === "true" && actionObj.visibilityScript?.length) {
                let scriptResult = sn_snippets.QuickAction.evaluateScript(nacmActionTableName, actionObj.sysId, null, actionObj.visibilityScript, newScriptInputs);
                return typeof scriptResult === 'boolean' ? scriptResult : false;
            } else {
                return true;
            }
        } catch (err) {
            this.logger.error(`WWNA: Error while Evaluating Action Visibility Condition Action Name: ${actionDetails.name}` + err?.message);
            return false;
        }
    },
    fetchAllSkillConfigsForSkillIdAndFilter: function(skill_id, skillFilter, record_table_name, record_sys_id, skill_table_name, skill_config_id, wwnaComponentIdsToExclude, filterVariableSet = false, fetchAndCheckWwnaActive = false) {

        var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
        let parentSkillConfigs = this.disableDuplicateVarSetMerge || !nowAssistSkillConfig.getAllSkillConfigurationsWithBaseTableFallback ? nowAssistSkillConfig.getSkillConfigurationWithBaseTableFallback(skill_id, skillFilter, false, this.domainGr || this.recordGr) : nowAssistSkillConfig.getAllSkillConfigurationsWithBaseTableFallback(skill_id, skillFilter, false, this.domainGr || this.recordGr);
        if (this.disableDuplicateVarSetMerge || !nowAssistSkillConfig.getAllSkillConfigurationsWithBaseTableFallback) {
            parentSkillConfigs = parentSkillConfigs ? [parentSkillConfigs] : [];
        }
        let newParentSkillConfigs = [];
        let tempSkillConfigIdsToFetch = [];
        let mainConfigSkillConfigObj = null;
        const {
            WWNA_NACM_CONFIG_MAPPING_TYPE_ID,
            WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID,
            WWNA_COMMON_ACTIONS_CAPABILITY_ID
        } = sn_wwna.WWNAConstants;

        if (!this.naaWwnaUtils) {
            this.naaWwnaUtils = new sn_wwna.NAAWWNAUtils();
        }


        parentSkillConfigs.forEach((parentSkillConfig) => {
            if (!this.skillToSkillConfigMap[parentSkillConfig?.sys_id]) {
                tempSkillConfigIdsToFetch.push(parentSkillConfig?.sys_id);
            }
        });

        if (tempSkillConfigIdsToFetch.length) {
            this.updateSkillToSkillConfigMap(tempSkillConfigIdsToFetch);
        }

        parentSkillConfigs.forEach((parentSkillConfig, index) => {
            let generalDetailsObj;
            let nacmSkillConfigRecordIds = new Set();
            let nacmSkillConfig;
            const parentSkillConfigId = parentSkillConfig?.sys_id;
            let isParentSkillConfigExist = !!parentSkillConfig?.variable_sets?.length;
            let isNacmSkillConfigExist = false;
            if (isParentSkillConfigExist) {
                parentSkillConfig.variable_sets.forEach((varSetObj) => {
                    if (varSetObj.config_type === WWNA_NACM_CONFIG_MAPPING_TYPE_ID && varSetObj.props?.nacm_config?.length) {
                        varSetObj.props.nacm_config.split(',').forEach((configId) => {
                            if (configId !== skill_config_id) {
                                nacmSkillConfigRecordIds.add(configId);
                            }
                        });
                    } else if (varSetObj.config_type === WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID) {
                        generalDetailsObj = varSetObj;
                    }
                });

                parentSkillConfig = this._formatNacmConfig(parentSkillConfig, wwnaComponentIdsToExclude, generalDetailsObj ? true : filterVariableSet, fetchAndCheckWwnaActive, skill_id);
                if (!checkIfSkillConfigIsValid(parentSkillConfig, skill_config_id)) {
                    parentSkillConfig = null;
                    isParentSkillConfigExist = false;
                }
            }
            if (isParentSkillConfigExist) {
                nacmSkillConfigRecordIds = [...nacmSkillConfigRecordIds];
                if (nacmSkillConfigRecordIds.length) {
                    nacmSkillConfig = this.fetchSkillConfigByIds(nacmSkillConfigRecordIds, wwnaComponentIdsToExclude, record_table_name, record_sys_id, skill_config_id, false, skill_id);
                } else {
                    let tempSkillFilter = {
                        parentSkillConfigId: parentSkillConfigId
                    };

                    if (this.isDomainSeprated && !this.domainGr && !this.recordGr) {
                        skillConfigExists = nowAssistSkillConfig.doesSkillConfigExistForRecord(WWNA_COMMON_ACTIONS_CAPABILITY_ID, tempSkillFilter, false);
                        if (skillConfigExists) {
                            this.setRecordGr(record_table_name, record_sys_id, skill_id, this.utils);
                        }
                    }
                    nacmSkillConfig = this.fetchAllSkillConfigsForSkillIdAndFilter(WWNA_COMMON_ACTIONS_CAPABILITY_ID, tempSkillFilter, record_table_name, record_sys_id, skill_table_name, skill_config_id, wwnaComponentIdsToExclude);
                    if (parentSkillConfigId === nacmSkillConfig?.sys_id) {
                        nacmSkillConfig = {
                            variable_sets: []
                        };
                    } else {
                        nacmSkillConfig = this._formatNacmConfig(nacmSkillConfig, wwnaComponentIdsToExclude, true, false, skill_id);
                    }
                }
                if (nacmSkillConfig && nacmSkillConfig?.variable_sets?.length) {
                    parentSkillConfig.variable_sets = [...parentSkillConfig.variable_sets, ...nacmSkillConfig.variable_sets];
                }
            }

            if (isParentSkillConfigExist) {
                if (index === 0 || !mainConfigSkillConfigObj) {
                    mainConfigSkillConfigObj = parentSkillConfig;
                } else {
                    mainConfigSkillConfigObj.variable_sets = mainConfigSkillConfigObj.variable_sets.concat(parentSkillConfig.variable_sets);
                }
            }
        });
        return mainConfigSkillConfigObj || {};
    },
    _mergeDuplicateVarSets: function(skillConfigObj, tableName, wwnaComponentIdsToExclude = []) {

        let varSetIndexedByComponentId = {};
		if(!wwnaComponentIdsToExclude){
			wwnaComponentIdsToExclude = [];
		}
		wwnaComponentIdsToExclude = new Set(wwnaComponentIdsToExclude);
        let baseTables = this._getRootTableFromHierarchy(tableName, true);
        baseTables.filter((tableName) => tableName !== tableName);
        if (!this.naaWwnaUtils) {
            this.naaWwnaUtils = new sn_wwna.NAAWWNAUtils();
        }
        const WWNA_CONFIG_TYPE = sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID;
        const variablesToBeFiltered = ['default_preset_action', 'open_prompt_action', 'wwna_component_id', 'is_active', 'table'];
        var nacmConfigVariables = this.naaWwnaUtils.getVariableList(WWNA_CONFIG_TYPE);
        const FILTERED_ACTION_KEYS = this.ACTION_KEYS.filter((actionKey) => !variablesToBeFiltered.includes(actionKey)).concat(['configured_columns']);
        nacmConfigVariables = nacmConfigVariables.filter((configVariable) => !variablesToBeFiltered.includes(configVariable.columnName));

        let additionalVarSet = [];

        skillConfigObj.variable_sets.forEach((variableSetObj) => {
            if (
                variableSetObj.config_type === WWNA_CONFIG_TYPE &&
                (variableSetObj.props.config_type === sn_wwna.WWNAConstants.CONFIG_TYPE.TABLE || variableSetObj.props?.configured_columns?.length) &&
                (variableSetObj.props.table === tableName ||
                    (baseTables.includes(variableSetObj.props.table) && String(variableSetObj.props.enable_extended_tables) === "true")
                )
            ) {
                const isNewConfig = variableSetObj.isNewConfig;
                if (isNewConfig) {
                    const componentId = variableSetObj?.props?.wwna_component_id;
                    varSetIndexedByComponentId = addOrUpdateVariableSetToIndex(varSetIndexedByComponentId, variableSetObj, componentId, nacmConfigVariables, FILTERED_ACTION_KEYS, tableName);

                } else if (variableSetObj?.props?.configured_columns.length) {
                    const columnsToBeAdded = variableSetObj.props.configured_columns.split(',');
                    columnsToBeAdded.forEach((columnName) => {
						if(wwnaComponentIdsToExclude.has(columnName)){
							// This is to avoid including BU specific configuration in merging
							additionalVarSet.push(JSON.parse(JSON.stringify(variableSetObj)));
						} else {
							varSetIndexedByComponentId = addOrUpdateVariableSetToIndex(varSetIndexedByComponentId, variableSetObj, columnName, nacmConfigVariables, FILTERED_ACTION_KEYS, tableName);
						}
                        
                    });
                }
            } else {

                additionalVarSet.push(variableSetObj);
            }
        });
        skillConfigObj.variable_sets = [...Object.values(varSetIndexedByComponentId), ...additionalVarSet];
        return skillConfigObj;
    },
    updateSkillToSkillConfigMap: function(skillConfigIds = [], shouldFetchConfigStatus = false) {
        if (!this.naaWwnaUtils) {
            this.naaWwnaUtils = new sn_wwna.NAAWWNAUtils();
        }
        if (!skillConfigIds) {
            skillConfigIds = [];
        }
        skillConfigIds = skillConfigIds.filter((skillConfigId) => !this.skillToSkillConfigMap[skillConfigId]);
        this.skillToSkillConfigMap = Object.assign(this.skillToSkillConfigMap, this.naaWwnaUtils.fetchM2MSkillMap(shouldFetchConfigStatus, skillConfigIds));
    },
    fetchSkillConfigurations: function(skillConfigIds = [], domainGr) {
        var skillConfigs = [];
        try {
            var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            if (!skillConfigIds || !skillConfigIds?.length) {
                return skillConfigs;
            }
            skillConfigIds.forEach((skillConfigId) => {
                let nacmConfig = nowAssistSkillConfig.getSkillConfiguration(skillConfigId, domainGr);
                if (nacmConfig) {
                    skillConfigs.push(nacmConfig);
                }
            });
            return skillConfigs;
        } catch (err) {
            this.logger.error('WWNA: Error while fetching Skill Configurations By Ids: ' + err?.message);
            return skillConfigs;
        }
    },
    type: 'WWNAUtils'
};
