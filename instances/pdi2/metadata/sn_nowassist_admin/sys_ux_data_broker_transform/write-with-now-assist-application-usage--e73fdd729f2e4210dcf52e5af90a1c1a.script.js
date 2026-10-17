function transform(inputs) {

    var nacmConfigurations = [];
    var result = {
        isFetchAPICalled: inputs.isFetchAPICalled
    };
    if (!inputs.isFetchAPICalled) {
        return result;
    }
    const shouldAddActionColumn = (NAARoleUtil._hasRole("sn_nowassist_admin.nsa_admin") || gs.hasRole("sn_skill_builder.admin") || gs.hasRole('maint')) && !NAARoleUtil.isNAAReadOnlyUser();
    try {
        var searchStr = inputs.searchStr || "";
        var queryParams;
        var operation;

        if (searchStr == "") {
            queryParams = {};
        } else {
            switch (searchStr[0]) {
                case "*":
                    operation = "CONTAINS";
                    searchStr = searchStr.substring(1);
                    break;
                default:
                    operation = "STARTSWITH";
            }

            queryParams = {
                0: {
                    key: "skill_config.name",
                    operand: operation,
                    value: searchStr
                },
                1: {
                    key: "skill_config.skill_family.parent.name",
                    operand: operation,
                    value: searchStr
                },
                2: {
                    key: "skill_config.skill_family.parent.parent.name",
                    operand: operation,
                    value: searchStr
                }
            };
        }
        var nacmConfigs = NAASkillConfigUtil.fetchNACMConfigs(queryParams, inputs.limit, inputs.offset);
        var wwnaSkills = nacmConfigs.data;

        wwnaSkills.forEach((wwnaSkill) => {
            var skillFamily = wwnaSkill.skillFamily;
            var skillConfigId = wwnaSkill.skillConfigId;
            var workflow = wwnaSkill.workflow;
            var product = wwnaSkill.product;
            var feature = wwnaSkill.feature;
            var skillDetails = wwnaSkill.skillDetails;
            var skillName = wwnaSkill.skillName;
            var skillConfigParentId = wwnaSkill.skillConfigParentId;
            var featureId = wwnaSkill.featureId;
            var status = wwnaSkill.status;
            var disabledActions = wwnaSkill?.disabledActions || [];
            var skillConfigNavigationURL = "now/now-assist-admin/skill-guided-setup/" + skillConfigId;



            var configurationRowPayload = {
                "key": skillConfigId,
                "cells": {
                    "skill": {
                        "value": skillName
                    },
                    "product": {
                        "value": product
                    },
                    "workflow": {
                        "value": workflow
                    },
                    "status": {
                        "componentProps": {
                            "color": skillDetails['colour'],
                            "label": skillDetails['label'],
                            "variant": "tertiary",
                            "icon": "circle-fill"
                        }
                    }
                }
            };

            if (shouldAddActionColumn) {
                configurationRowPayload.cells["action"] = {
                    "componentProps": {
                        "icon": "ellipsis-vertical-fill",
                        "variant": "tertiary",
                        "bare": true,
                        "hideCaret": true,
                        "hideLabel": true,
                        "select": "none",
                        "items": (status === "true" || status === "1") ? [{
                                id: 'edit_configuration',
                                label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Edit configuration"),
                                disabled: disabledActions.includes('edit_configuration') ? true : false
                            },
                            {
                                id: 'deactivate_configuration',
                                label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Deactivate"),
                                disabled: disabledActions.includes('deactivate_configuration') ? true : false
                            }
                        ] : [{
                            id: 'activate_configuration',
                            label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Activate"),
                            disabled: disabledActions.includes('activate_configuration') ? true : false
                        }],
                        "configAria": {
                            "panel": {
                                "aria-label": "Action"
                            },
                            "trigger": {
                                "aria-label": "Action"
                            }
                        },
                    }

                };
                if (gs.hasRole("maint") && !wwnaSkill.isNewConfig) {
                    configurationRowPayload.cells["action"].componentProps.items.push({
                        id: 'migrate_configuration',
                        label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Migrate configuration")
                    });
                }
            }


            nacmConfigurations.push(configurationRowPayload);
        });


        var configColumnDefinitions = {

            "columns": [{
                    "cellEditingDisabled": true,
                    "key": "skill",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Configuration Name"),
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
                    "key": "workflow",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Workflow"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "componentTag": "now-highlighted-value",
                    "key": "status",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Status"),
                    "type": "custom"
                }
            ]
        };

        if (shouldAddActionColumn) {
            configColumnDefinitions.columns.push({
                "cellEditingDisabled": true,
                "componentTag": "now-dropdown",
                "key": "action",
                "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Action"),
                "type": "custom"
            });
        }

        return Object.assign(result, {
            rowDefinitions: nacmConfigurations,
            columnDefinitions: configColumnDefinitions,
            wwwnaEnabled: (nacmConfigurations.length > 0) ? true : false,
            totalCount: nacmConfigs.count
        });

    } catch (error) {
        gs.error("Failed to get WWNA configured skills" + error.toString());
    }
}
