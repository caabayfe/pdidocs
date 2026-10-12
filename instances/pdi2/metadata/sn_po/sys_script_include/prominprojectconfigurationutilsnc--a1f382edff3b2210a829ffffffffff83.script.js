var ProminProjectConfigurationUtilSNC = Class.create();
ProminProjectConfigurationUtilSNC.prototype = {
    initialize: function() {

        this.tableName = {
            "automationReq": "sn_ac_automation_request",
            "cimReq": "sn_cim_register",
        };

        this.plugins = {
            automationCenterPluginId: 'sn_ac',
            cimPluginId: 'sn_cim',
            dynamicTranslationPluginId: 'com.glide.dynamic_translation',
            taskMiningPluginId: 'sn_tm_core',
            agentActivityPluginId: 'sn_icu',
            nowAssistForPromin: 'sn_assist_promin',
        };

        this.sysProperties = {
            taskMiningBlockedTables: "promin.task_mining.blocked.tables",
            blockedTables: "promin.blocked.tables",
            primaryMetric: "promin.primary_metric",
            secondaryMetric: "promin.secondary_metric",
            entityBgTransparency: "promin.entity_bg_transparency",
            glideInstanceReleaseName: "com.glide.embedded_help.version"
        };
    },

    _getBlockedTables: function(sysProperty) {
        var prominBlockedTables = gs.getProperty(sysProperty, '');
        if (!prominBlockedTables) {
            return [];
        }
        var blockedTablesSet = prominBlockedTables.split(',').map(function(item) {
            return item.trim();
        });
        return blockedTablesSet;
    },

    getProminIntegrations: function() {
        var automationCenterCanCreate = false,
            automationCenterCanRead = false,
            isAutomationCenterPluginExist = GlidePluginManager.isActive(this.plugins.automationCenterPluginId);

        if (isAutomationCenterPluginExist) {
            var grAutomationReq = new GlideRecord(this.tableName.automationReq);
            automationCenterCanCreate = grAutomationReq.canCreate();
            automationCenterCanRead = grAutomationReq.canRead();
        }
        var cimCanCreate = false,
            cimCanRead = false,
            iscimPluginExist = GlidePluginManager.isActive(this.plugins.cimPluginId);

        if (iscimPluginExist) {
            var grCimReq = new GlideRecord(this.tableName.cimReq);
            cimCanCreate = grCimReq.canCreate();
            cimCanRead = grCimReq.canRead();
        }

        var nowAssistUtil = new sn_po.ProminNowAssistUtil();
        var nowAssistSkills = nowAssistUtil.SKILLS;

        return {
            integrations: {
                taskMining: {
                    isPluginActive: GlidePluginManager.isActive(this.plugins.taskMiningPluginId),
                    hasTaskMiningRole: gs.hasRole('sn_tm_core.analyst') || gs.hasRole('sn_tm_core.admin') || gs.hasRole('sn_tm_core.power_user'),
                },
                automationCenter: {
                    isPluginActive: isAutomationCenterPluginExist,
                    permissions: {
                        canCreate: automationCenterCanCreate,
                        canRead: automationCenterCanRead
                    }
                },
                cim: {
                    isPluginActive: iscimPluginExist,
                    permissions: {
                        canCreate: cimCanCreate,
                        canRead: cimCanRead
                    }
                },
                dynamicTranslation: GlidePluginManager.isActive(this.plugins.dynamicTranslationPluginId),
                nowAssistForCreator: {
                    isSkillActive: GlidePluginManager.isActive(this.plugins.agentActivityPluginId),
                },
                nowAssistForPromin: {
                    isPluginActive: GlidePluginManager.isActive(this.plugins.nowAssistForPromin),
                },
                nowAssistSkills: {
                    generateProcessConfig: {
                        isSkillActive: nowAssistUtil.isSkillConfigActive(nowAssistSkills.PROCESS_CONFIG_RECOMMENDATIONS.skillConfigId),
                    },
                    generateStateResponsibilitiesMapping: {
                        isSkillActive: nowAssistUtil.isSkillConfigActive(nowAssistSkills.STATE_RESPONSIBILITY_MAPPING.skillConfigId),
                    },
                },
            },
            sysProperties: {
                taskMiningBlockedTables: this._getBlockedTables(this.sysProperties.taskMiningBlockedTables),
                blockedTables: this._getBlockedTables(this.sysProperties.blockedTables),
                primaryMetric: gs.getProperty(this.sysProperties.primaryMetric, 'caseFreq'),
                secondaryMetric: gs.getProperty(this.sysProperties.secondaryMetric, 'avgDuration'),
                entityBgTransparency: gs.getProperty(this.sysProperties.entityBgTransparency, '0.8'),
                glideInstanceReleaseName: gs.getProperty(this.sysProperties.glideInstanceReleaseName, ''),
            },
        };
    },

    type: 'ProminProjectConfigurationUtilSNC'
};
