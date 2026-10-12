var SkillDefinitions = Class.create();
SkillDefinitions.prototype = {
    initialize: function() {},

    getSkills: function(sysIds) {
        const skillConfigs = {};
        const skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
        const query = sysIds ? `sys_idIN${sysIds}` : '';
        skillConfigGr.addQuery(query);
        skillConfigGr.query();

        while (skillConfigGr.next()) {
            const skillConfigSysId = skillConfigGr.getUniqueValue();
            const oneExtendCapabilityId = skillConfigGr.getValue('skill_id');
            const skillConfig = this._getSkillConfig(skillConfigSysId);
            const deliveryStepConfigTypeId = "7dfdff5893b64210aa5730f164891837";
            const capabilityRecord = this._getCapabilityInfo(oneExtendCapabilityId);
            const defaultLLMSet = this._getDefaultLLMStatus(oneExtendCapabilityId);

            const skillEnabled = (skillConfig.variable_sets || []).filter((var_set) => {
                return (
                    var_set.config_type == deliveryStepConfigTypeId &&
                    var_set.props.enable_ui_builder === "true"
                );
            }).length;

            if (skillEnabled) {
                const skillAttributes = this._getSkillAttributes(oneExtendCapabilityId);

                skillConfigs[skillConfigSysId] = {
                    oneExtendCapabilityId: oneExtendCapabilityId,
                    description: capabilityRecord.description,
                    shortDescription: capabilityRecord.shortDescription,
                    inputs: skillAttributes.inputs,
                    outputs: skillAttributes.outputs,
                    config: skillConfig,
                    defaultLLMSet: defaultLLMSet
                };
            }
        }

        // fetch needed whitelisted skills
        const oneExtendCapabilityGr = new GlideRecord('sys_one_extend_capability');
        const whiteListedSysIds = BuilderToolkitConstants.WHITELISTED_ONE_EXTEND_CAPABILITY_SYS_IDS;
        const whiteListedQuery = `sys_idIN${whiteListedSysIds}`;

        oneExtendCapabilityGr.addQuery(whiteListedQuery);
        oneExtendCapabilityGr.query();

        while (oneExtendCapabilityGr.next()) {
            const oneExtendCapabilitySysId = oneExtendCapabilityGr.getUniqueValue();
            const skillAttributes = this._getSkillAttributes(oneExtendCapabilitySysId);
            const defaultLLMSet = this._getDefaultLLMStatus(oneExtendCapabilitySysId);

            skillConfigs[oneExtendCapabilitySysId] = {
                oneExtendCapabilityId: oneExtendCapabilitySysId,
                description: oneExtendCapabilityGr.getValue('description'),
                shortDescription: oneExtendCapabilityGr.getValue('shortDescription'),
                inputs: skillAttributes.inputs,
                outputs: skillAttributes.outputs,
                config: {
                    active: true,
                    name: oneExtendCapabilityGr.getValue('name'),
                    variable_sets: [],
                    sys_id: null
                },
                defaultLLMSet: defaultLLMSet
            };
        }

        return skillConfigs;
    },

    _getCapabilityInfo: function(oneExtendCapabilityId) {
        const capabilityRecord = new GlideRecord('sys_one_extend_capability');

        if (capabilityRecord.get(oneExtendCapabilityId)) {
            return {
                description: capabilityRecord.description,
                shortDescription: capabilityRecord.short_description
            };
        }
    },

    _getSkillAttributes: function(oneExtendCapabilityId) {
        const skillAttributeGr = new GlideRecord('sys_one_extend_definition_attribute');
        skillAttributeGr.addQuery('capability', oneExtendCapabilityId);
        skillAttributeGr.query();

        const inputs = {};
        const outputs = {};

        while (skillAttributeGr.next()) {
            const sysId = skillAttributeGr.getUniqueValue();
            const type = skillAttributeGr.getValue('type');
            const attributeData = {
                name: skillAttributeGr.getValue('name'),
                dataType: skillAttributeGr.getValue('data_type'),
                active: skillAttributeGr.getDisplayValue('active') == "true",
                description: skillAttributeGr.getValue('description'),
                mandatory: skillAttributeGr.getDisplayValue('mandatory') == "true",
                type: type,
                schema: JSON.parse(skillAttributeGr.getValue('schema')),
                choices: skillAttributeGr.getValue('choice_list'),
                label: skillAttributeGr.getValue('label')
            };

            if (type == 'input') {
                inputs[sysId] = attributeData;
            }

            if (type == 'output') {
                outputs[sysId] = attributeData;
            }
        }

        return {
            inputs: inputs,
            outputs: outputs
        };

    },

    _getSkillConfig: function(skillConfigId) {
        const assistAdminHelper = new sn_nowassist_admin.NowAssistSkillConfig();
        const skillConfig = assistAdminHelper.getSkillConfiguration(skillConfigId);

        return skillConfig;
    },

    _getDefaultLLMStatus: function(oneExtendCapabilityId) {
        const oneExtendDefConfigGr = new GlideRecord('sys_one_extend_definition_config');
        oneExtendDefConfigGr.addQuery('capability', '=', oneExtendCapabilityId);
        oneExtendDefConfigGr.query();

        let defaultLLMSet = false;

        while (oneExtendDefConfigGr.next()) {
            if (oneExtendDefConfigGr.getDisplayValue('default') === 'true') {
                defaultLLMSet = true;
                break;
            }
        }

        return defaultLLMSet;
    },

    /**
     * @param data {array} an array of data elements from an MCP
     */
    getSkillsFromData: function(data = []) {
        if (GlidePluginManager.isActive('sn_generative_ai')) {
            const skillIds = data.reduce(function(acc, broker) {
                if (broker?.definition?.type === 'CONTROLLER' &&
                    broker?.definition?.id === '37d676c6ff382210461effffffffffde') {
                    const skillConfigId = broker?.inputValues?.skillConfigId?.value || '';

                    if (skillConfigId) {
                        acc.push(skillConfigId);
                    } else {
                        // If we are here, we should only have oneExtendCapabilityIds that are whitelisted
                        const oneExtendCapabilityId = broker?.inputValues?.oneExtendCapabilityId?.value || '';
                        if (oneExtendCapabilityId) {
                            acc.push(oneExtendCapabilityId);
                        }
                    }
                }
                return acc;
            }, []).join(',');

            if (skillIds) {
                const skillDefinitions = this.getSkills(skillIds);
                return skillDefinitions;
            }
            return {};
        } else {
            return {};
        }
    },
    type: 'SkillDefinitions'
};
