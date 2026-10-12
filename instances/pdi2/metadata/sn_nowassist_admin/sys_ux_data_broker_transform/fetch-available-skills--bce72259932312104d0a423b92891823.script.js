function transform(inputs) {
    var wwwna_application_available = [];
    var result = {
        isFetchAPICalled: inputs.isFetchAPICalled
    };
    if (!inputs.isFetchAPICalled) {
        return result;
    }
    const shouldAddActionColumn = !NAARoleUtil.isNAAReadOnlyUser();
    try {
        var searchStr = inputs.searchStr || "";
        var queryParams;
        var operation;

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
                key: "name",
                operand: operation,
                value: searchStr
            }
        };

        var nacmConfigs = NAASkillConfigUtil.fetchNacmSkills(queryParams, inputs.limit, inputs.offset);
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

            var rowPayload = {
                "key": skillConfigId,
                "cells": {
                    "skill": {
                        "value": skillName
                    },
                    "workflow": {
                        "value": workflow
                    },
                    "delivery": {
                        "value": wwnaSkill.delivery
                    },
                    "status": {
                        "componentProps": {
                            "color": skillDetails['colour'],
                            "label": skillDetails['label'],
                            "variant": "tertiary",
                            "icon": "circle-fill"
                        }
                    },
                    "action": {
                        "componentProps": {
                            "icon": "ellipsis-vertical-fill",
                            "variant": "tertiary",
                            "bare": true,
                            "hideCaret": true,
                            "hideLabel": true,
                            "select": "none",
                            "items": (status === "true" || status === "1") ? [{
                                    id: 'manage_skill',
                                    label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Manage skill"),
                                    disabled: disabledActions.includes('manage_skill') ? true : false
                                },
                                {
                                    id: 'deactivate_skill',
                                    label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Deactivate"),
                                    disabled: disabledActions.includes('deactivate_skill') ? true : false
                                }
                            ] : [{
                                id: 'activate_skill',
                                label: sn_i18n.Message.getMessage("sn_nowassist_admin", "Activate skill"),
                                disabled: disabledActions.includes('activate_skill') ? true : false
                            }]
                        }
                    }
                }
            };

            wwwna_application_available.push(rowPayload);
        });

        var columnDefinitions = {

            "columns": [{
                    "cellEditingDisabled": true,
                    "key": "skill",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill Name"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "workflow",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Product workflow"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "delivery",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Delivery"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "componentTag": "now-highlighted-value",
                    "key": "status",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill status"),
                    "type": "custom"
                }

            ]
        };

        if (shouldAddActionColumn) {
            columnDefinitions.columns.push({
                "cellEditingDisabled": true,
                "componentTag": "now-dropdown",
                "key": "action",
                "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Action"),
                "type": "custom"
            });
        }

        return Object.assign(result, {
            columnDefinitions: columnDefinitions,
            rowDefinitions: wwwna_application_available,
            wwwnaEnabled: (wwwna_application_available.length > 0) ? true : false,
            totalCount: nacmConfigs.count
        });
    } catch (error) {
        gs.error("Failed to get NAcm available skills" + error.toString());
    }
}
