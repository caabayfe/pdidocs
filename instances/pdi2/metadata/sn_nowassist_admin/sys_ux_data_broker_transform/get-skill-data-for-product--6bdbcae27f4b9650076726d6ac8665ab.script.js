function transform(input) {
    try {
        var productId = input.product_id;
        var allowedProviders = NAAManageLLMAPI.getAllowedProviders();
        var _nonCompliantSkills = NAASkillConfigUtil.getNonComplaintSkills(allowedProviders,false, false).map(skill => skill.id);
        var isFallbackEnabled = allowedProviders.fallback;
		var nonCompliantSkills = isFallbackEnabled ? [] : _nonCompliantSkills;
        var selectedWorkflow = NAAWorkFlowFeatureUtil.getWorkflowNameByProductId(productId);
        var workFlowName = selectedWorkflow['workFlowName'].toString();
        var productName = selectedWorkflow?.productName;

        var title = gs.getMessage("Now Assist skills for {0}", productName);
        var editedInNASKLabel = sn_i18n.Message.getMessage("sn_nowassist_admin", "Edited in NASK");
        var customLabel = sn_i18n.Message.getMessage("sn_nowassist_admin", "Custom");
        var oobLabel = sn_i18n.Message.getMessage("sn_nowassist_admin", "Out-of-box");
        var formattedPayload = [];
        var rowDetails = [];
        var featuresByProduct = NAAWorkFlowFeatureUtil.getFeatures(productId);
        var skills = NAAWorkFlowFeatureUtil.getSkillListingPayload(featuresByProduct.map(feature => feature.id));
        //var skills = NAASkillConfigUtil.getSkillsOfProduct(productId); //Older api implementation
        var features = [];
        var skillFamilyDetails = [];
        var licenseForFulfillerSKU = NAASkillConfigUtil.checkLicenseForFulfillerSKU();
		var isLTSRemoved = gs.getProperty('sn_generative_ai.is_lts_supported') === 'false';

        featuresByProduct.map((feature) => {
            skillFamilyDetails.push(NAASkillFamilyUtil._getSkillFamilyById(feature.id));
            features.push({
                id: feature.id,
                label: feature.label
            });
        });

        const regexForAnchor = /<a[^>]*>.*?<\/a>/;
        const skillFamilySummaryWithLinks = skillFamilyDetails.filter(obj => regexForAnchor.test(obj.description));

        var monitorResultsObj = {};
        var rowsDataActionsEnabled = {
            "customCellEmittedActions": ["NOW_BUTTON#CLICKED", "NOW_BUTTON_ICONIC#CLICKED"],
            "selectionEnabled": false,
            "actions": {
                "position": "end",
                "numActionIcons": 0,
                "hidden": false,
                "actionsItems": [{
                        "id": "edit_access",
                        "icon": "",
                        "label": gs.getMessage("Edit access"),
                        "action": "EDIT_ACCESS"
                    },
                    {
                        "id": "edit",
                        "icon": "",
                        "label": gs.getMessage("Edit"),
                        "action": "EDIT_ACTION"
                    },
                    {
                        "id": "duplicate",
                        "icon": "",
                        "label": gs.getMessage("Make a copy"),
                        "action": "DUPLICATE_SKILL"
                    }
                ]
            },
            "rows": []
        };

        if (NAAPluginUtil.isNowAssistDiagnosticsPluginInstalled()) {
            rowsDataActionsEnabled.actions.actionsItems.push({
                "id": "troubleshoot",
                "icon": "",
                "label": gs.getMessage("Run diagnostics"),
                "action": "TROUBLESHOOT_SKILL"
            }, {
                "id": "monitor_errors",
                "icon": "",
                "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "View Execution Errors"),
                "action": "MONITOR_ERRORS"
            });
        }

        var rowsDataActionsDisabled = {
            "customCellEmittedActions": ["NOW_BUTTON_ICONIC#CLICKED"],
            "selectionEnabled": false,
            "rows": []
        };

        var rowsData = rowsDataActionsDisabled;
        var one_extend_data = NAAGenAIUtil.getOneExtendDefConfigData();

        const skill_config_ids = skills.map(skill => skill.id);
        var skill_config_m2m_data = NAAGenAIUtil.getSkillConfM2MData(skill_config_ids);

        var skill_diagn_details = {};
        var dig_plugin_installed = NAAPluginUtil.isNowAssistDiagnosticsPluginInstalled();
        if (dig_plugin_installed) {
            var diagn_util = new sn_nowassist_diagn.NowAssistAdminDiagnosticUtil();
            dig_plugin_installed = diagn_util && typeof diagn_util.getTroubleshootDetails === 'function';
            if (dig_plugin_installed) {
                skill_diagn_details = diagn_util.getTroubleshootDetails(skill_config_ids);
            }
        }

        skills.forEach(function(skill) {
            var id = skill.id;
            var providerData = NAAGenAIUtil.getProvider(one_extend_data, skill_config_m2m_data, skill, id);
            skill['provider_data'] = providerData;
        });

        skills = NAASkillConfigUtil._pruneSkillsByRoutingMatrix(skills);

        skills.forEach(function(skill) {
            var id = skill.id;

            var buttonLabel = skill.active ? gs.getMessage('Deactivate skill') : skill.override_config?.activateSkillProps?.label || gs.getMessage('Activate skill');
            var buttonAriaConfig = skill.active ? gs.getMessage('Deactivate skill for {0}', skill.label) : gs.getMessage('Activate skill for {0}', skill.label);
            var buttonLabelList = skill.active ? gs.getMessage('Deactivate') : skill.override_config?.activateSkillProps?.label || gs.getMessage('Activate');

            var skillState;
            var skillStateColor;
            var res = NAASkillConfigUtil.getSkillDetails(skill.state);
            skillState = res['label'];
            skillStateColor = res['colour'];
            var label = skill.label;
            var description = skill.description;
            if (!skill.has_var_set && !skill.active) {
                buttonLabel = gs.getMessage('Turn on');
                buttonLabelList = gs.getMessage('Turn on');
                buttonAriaConfig = gs.getMessage('Turn on skill for {0}', skill.label);
            }

            var providerData = NAAGenAIUtil.getProvider(one_extend_data, skill_config_m2m_data, skill, id);

            var modelAvailableResult;
			var skillWithoutProvider= providerData?.skillConfigLlmSet?.size === 0 || providerData?.skillConfigLlmSet?.values().next().value == null;
            if (skillWithoutProvider || allowedProviders["routing"] == "global") {
                modelAvailableResult = {
                    status: "Success",
                    modelAvailable: true
                };
            } else {
                modelAvailableResult = NAAGenAIUtil.isModelDataAvailable(skill.id, skill, skill_config_m2m_data, providerData);
            }


            var skillProvider = [...providerData["skillConfigLlmSet"]].join(',');
            var capabilityName = skill.capabilityName && skill.capabilityName.length > 0 ? skill.capabilityName.split(": ")[1] : "";

            var excludedActions = [];

            var moreActionsItems = [];
            if (skill.can_write) {
                rowsData = rowsDataActionsEnabled;
                if (skill.has_var_set.toString() === "true" && skill.active.toString() === "true" && !(nonCompliantSkills.includes(id))) {
                    moreActionsItems.push({
                        id: "edit",
                        skillId: skill.id,
                        skillName: label,
                        domain: skill.sys_domain,
                        label: gs.getMessage("Edit")
                    });
                } else {
                    excludedActions.push("edit");
                }
                if (!skill.has_var_set && skill.active.toString() === "true") {
                    moreActionsItems.push({
                        id: "edit_access",
                        skillId: skill.id,
                        skillName: label,
                        domain: skill.sys_domain,
                        label: gs.getMessage("Edit access")
                    });
                }
				else{
					excludedActions.push("edit_access");
				}

                if (skill.is_template && !skill.edited_in_nask && (modelAvailableResult.status === "Success" ? modelAvailableResult.modelAvailable : false) && !(nonCompliantSkills.includes(id)) && !licenseForFulfillerSKU) {
                    moreActionsItems.push({
                        id: "duplicate",
                        skillId: skill.id,
                        skillName: label,
                        domain: skill.sys_domain,
                        label: gs.getMessage("Make a copy")
                    });
                } else {
                    excludedActions.push("duplicate");
                }

                if (dig_plugin_installed) {
                    var skill_diagn_details_ind = skill_diagn_details[id];

                    if (skill_diagn_details_ind && skill_diagn_details_ind['show_troubleshoot']) {
                        moreActionsItems.push({
                            id: "troubleshoot",
                            skillId: skill.id,
                            skillName: label,
                            domain: skill.sys_domain,
                            label: gs.getMessage("Run diagnostics")
                        });
                    } else {
                        excludedActions.push("troubleshoot");
                    }

                    if (skill_diagn_details_ind && skill_diagn_details_ind['show_monitor_errors']) {
                        var monitorResultsData = {
                            items: monitoringLogs,
                            count: sn_i18n.Message.getMessage("sn_nowassist_admin", "Total ({count})", {
                                count: monitoringLogs.length.toString()
                            }),
                            subHeading: sn_i18n.Message.getMessage("sn_nowassist_admin", "Below are the monitoring results for the skill, {skillName}", {
                                skillName: label
                            })
                        };
                        monitorResultsObj[skill.id] = monitorResultsData;
                        moreActionsItems.push({
                            id: "monitor_errors",
                            skillId: skill.id,
                            skillName: label,
                            domain: skill.sys_domain,
                            label: sn_i18n.Message.getMessage("sn_nowassist_admin", "View Execution Errors")
                        });
                    } else {
                        excludedActions.push("monitor_errors");
                    }
                }


            }

			var skillProviderIds = providerData?.skillConfigGenAiProviderIds ? providerData?.skillConfigGenAiProviderIds:[];

			var showLTSRemovedAlert = skill.edited_in_nask && isLTSRemoved && skillProviderIds.includes(NAAConstant.GEN_AI_PROVIDER_NOW_LLM_LTS);


            var highlightedText = [];
            highlightedText.push({
                "visibility": true,
                "label": sn_i18n.Message.getMessage("sn_nowassist_admin", skillState),
                "color": skillStateColor
            });
            if (skill.edited_in_nask) {
                highlightedText.push({
                    "visibility": true,
                    "label": editedInNASKLabel,
                    "color": 'gray'
                });
            } else if (!gs.nil(skill.type) && skill.type === "custom") {
                highlightedText.push({
                    "visibility": true,
                    "label": customLabel,
                    "color": "gray"
                });
            } else {
                highlightedText.push({
                    "visibility": true,
                    "label": oobLabel,
                    "color": 'gray'
                });
            }
            if (skillProvider != "" && skillProvider != "undefined") {
                highlightedText.push({
                    "visibility": true,
                    "label":  skillProvider,
                    "color": "gray"
                });
            }
            var lastUpdateDetails = sn_i18n.Message.getMessage("sn_nowassist_admin", "Last updated: {lastUpdatedBy}, {lastUpdatedOn}", {
                lastUpdatedBy: skill.latest_sys_updates_by,
                lastUpdatedOn: NAADateUtil.convertDateFormat(skill.latest_sys_updates_on)
            });
            var isWriteDisabled = !skill.can_write;
            var isOverridedDisabled = Boolean(skill.override_config?.activateSkillProps?.disable);
            var isSkillActive = skill.active.toString() === "true";
            var isModelUnavailable = (modelAvailableResult.status !== "Success" && !isSkillActive) ||
                (!isSkillActive && !modelAvailableResult.modelAvailable);
            var skillInfo = {
                "id": id,
                "has_var_set": skill.has_var_set,
                "nap_skill_applicability": skill.nap_skill_applicability,
                "success_message": gs.getMessage('{0}', skill.success_message),
                "skillState": sn_i18n.Message.getMessage("sn_nowassist_admin", skillState),
                "skillStateColor": skillStateColor,
                "skillType": skill.edited_in_nask ? 'edited-in-skill-kit' : skill.type,
                "modelAvailableResult": modelAvailableResult,
                "skillProvider": skillProvider,
                "skillProviderIds": skillProviderIds,
                "capabilityId": skill.capabilityId,
                "capabilityName": capabilityName,
                "skillFamily": skill.skill_family,
                "lastUpdateDetails": lastUpdateDetails,
                "latest_sys_updates_on": skill.latest_sys_updates_on,
                "created_on": skill.created_on,
                "skillFeature": sn_i18n.Message.getMessage("sn_nowassist_admin", skill.skill_feature),
                "title": {
                    "label": label,
                    "tag": "p",
                    "css": "*{margin:0;font-size:16px;font-weight:600;color:rgb(var(--now-color_text--secondary);}"
                },
                "description": {
                    "visibility": !gs.nil(description) ? true : false,
                    "label": description,
                    "css": {
                        "margin": "0",
                        "font-size": "12px",
                        "color": "rgb(var(--now-color_text--tertiary)"
                    }
                },
                "card_title": {
                    "visibility": false
                },
                "banner": {
                    "visibility": false,
                },
                "image": {
                    "visibility": false,
                },
                "highlightedText": highlightedText,
                "action": {
                    "type": skill.active ? 'deactivate' : 'activate',
                    "variant": skill.override_config?.activateSkillProps?.variant || (skill.active.toString() === "false" ? "secondary" : "tertiary"),
                    "label": buttonLabel,
                    "disabled": isWriteDisabled || isOverridedDisabled || isModelUnavailable || (nonCompliantSkills.includes(id) && !skill.active) || (showLTSRemovedAlert && !skill.active),
                    "icon": "",
                    //"visibility": featureId == "eaac4f3d53303110453cddeeff7b1266" ? false : true,
                    "configAria": {
                        "aria-label": buttonAriaConfig
                    },
                    "toolTipMsg": skill.override_config?.activateSkillProps?.toolTipMsg ?? buttonAriaConfig
                },
                "activateModal": {
                    "heading": skill.override_config?.successModalProps?.headerText,
                    "description": skill.override_config?.successModalProps?.successMessage,
                    "buttons": skill.override_config?.successModalProps?.buttons
                },
                "moreActions": moreActionsItems.length > 0 ? {
                    "visibility": true,
                    "variant": "secondary",
                    "items": moreActionsItems,
                    "configAria": {}
                } : {},
                "footer": {
                    "visibility": false
                },
                "skills": {
                    "visibility": false
                },
                "noSkills": {
                    "visibility": false
                },
                "domain": skill.sys_domain,
                "sys_overrides": skill.sys_overrides,
                "edited_in_nask": skill.edited_in_nask,
                "edited_in_nask_header": skill.edited_in_nask_header,
				"associatedCapabilityAndGenAiProviderMap" : NAAGenAIUtil.getProviderForSkillConfig(id).associatedCapabilityAndGenAiProviderMap,
				"showLTSRemovedAlert": modelAvailableResult.status && modelAvailableResult.modelAvailable && showLTSRemovedAlert,
				"allowEditingRMRoles": skill.type !== "oob" || skill.edited_in_nask || !!skill.parent,
				"parent": skill.parent || ""
            };

            formattedPayload.push(skillInfo);

            var rowPayload = {
                "key": id,
                "excludedActions": excludedActions,
                "cells": {
                    "name": {
                        "value": label,
                        "label": label,
                        "id": skill.id,
                        "nap": skill.nap_skill_applicability,
                        "has_var_set": skill.has_var_set,
                        "domain": skill.sys_domain || "global"
                    },
                    "modelNotAvailable": {
                        "componentProps": {
                            "icon": ((modelAvailableResult.status === "Success" ? modelAvailableResult.modelAvailable : false) && isFallbackEnabled && !showLTSRemovedAlert) ? "info-circle-outline" : "exclamation-triangle-outline",
                            "bare": true,
                            "hidePadding": true,
                            "size": "lg",
                            "hidden": (modelAvailableResult.status === "Success" ? modelAvailableResult.modelAvailable : false) && !_nonCompliantSkills.includes(id) && !showLTSRemovedAlert,
                        }
                    },
                    "state": {
                        "value": skillState,
                        "componentProps": {
                            "variant": skill.state === "active" ? "primary" : "tertiary",
                            "color": skillStateColor,
                            "label": skillState,
                        }
                    },
                    "skillType": {
                        "value": skill.edited_in_nask ? 'edited-in-skill-kit' : skill.type,
                        "componentProps": {
                            "variant": "tertiary",
                            "color": "gray",
                            "label": skill.edited_in_nask ? editedInNASKLabel : (skill.type === "custom" ? customLabel : oobLabel),
                        }
                    },
                    "llmProvider": {
                        "value": skillProvider,
                        "componentProps": {
                            "variant": skillProvider !== "" ? "tertiary" : "",
                            "color": skillProvider !== "" ? "gray" : "",
                            "label": skillProvider
                        }
                    },
                    "displayedOn": {
                        "value": skill.active ? skill.delivery : "",
                    },
                    "lastUpdated": {
                        "value": NAADateUtil.convertDateFormat(skill.latest_sys_updates_on),
                    },
                    "action": {
                        "componentProps": {
                            "variant": skill.active.toString() === "false" ? "secondary" : "tertiary",
                            "disabled": isWriteDisabled || isOverridedDisabled || isModelUnavailable || (nonCompliantSkills.includes(id) && !skill.active),
                            "size": "sm",
                            "id": skill.active.toString() === "false" ? "activate" : "deactivate",
                            "label": buttonLabelList,
                            "configAria": {
                                "aria-label": buttonAriaConfig
                            },
                            "style": {
                                "width": "5rem"
                            },
                            "tooltipContent": skill.override_config?.activateSkillProps?.toolTipMsg ?? buttonAriaConfig

                        },
                    }
                },
                "skillInfo": skillInfo
            };
            rowDetails.push(rowPayload);
            rowsData.rows.push(rowPayload);


        });

        var nameType = 'link';
        if ((skills.length > 0 && skills[0].can_write.toString() == "false") ||
            gs.nil(skills.find((skillConfig) => skillConfig.has_var_set == true))) {
            nameType = 'string';
        }

        var columnDefinitions = {
            "columns": [{
                    "key": "name",
                    "type": nameType,
                    "label": gs.getMessage("Name"),
                    "cellEditingDisabled": true,
                },
                {
                    "cellEditingDisabled": true,
                    "componentTag": "now-button-iconic",
                    "key": "modelNotAvailable",
                    "type": "custom",

                },
                {
                    "cellEditingDisabled": true,
                    "key": "state",
                    "componentTag": "now-highlighted-value",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Status"),
                    "type": "custom"

                },
                {
                    "cellEditingDisabled": true,
                    "key": "skillType",
                    "componentTag": "now-highlighted-value",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Skill type"),
                    "type": "custom"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "llmProvider",
                    "componentTag": "now-highlighted-value",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "LLM Provider"),
                    "type": "custom"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "lastUpdated",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Last updated"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "action",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Action"),
                    "componentTag": "now-button",
                    "type": "custom"
                }

            ]
        };

        if (selectedWorkflow.id !== NAAConstant.CREATOR_WORKFLOW_ID && selectedWorkflow.id !== NAAConstant.PLATFORM_WORKFLOW_ID) {
            columnDefinitions.columns.splice(5, 0, {
                "key": "displayedOn",
                "type": "string",
                "label": gs.getMessage("Displayed On"),
            });
        }

        var sessionDomain = gs.getSession().getCurrentDomainID();
        var sessionDomainName = "";

        if (sessionDomain) {
            sessionDomainName = NAADomainUtil.getDomainName(sessionDomain);
        } else {
            sessionDomain = "global";
            sessionDomainName = "Global";
        }

        var installPluginMessage;
        if (productId == NAAConstant.PLATFORM_WORKFLOW_ID) {
            installPluginMessage = sn_i18n.Message.getMessage("sn_nowassist_admin", "Install at least one product plugin before you can start activating Platform skills.");
        } else if (productId == NAAConstant.KNOWLEDGE_PRODUCT_SYS_ID) {
            installPluginMessage = sn_i18n.Message.getMessage("sn_nowassist_admin", "Install at least one product's now assist plugin (ITSM, CSM or HR) before you can start activating Knowledge skills.");
        } else {
            installPluginMessage = sn_i18n.Message.getMessage("sn_nowassist_admin", "Install the 'Now Assist for {productName}' product plugin before you can start activating any {productName} skills", {
                productName: productName
            });
        }

        var pluginUrl = productId == NAAConstant.PLATFORM_WORKFLOW_ID ? "/now/now-assist-admin/plugins" : "/now/now-assist-admin/plugins/params/workflow/" + selectedWorkflow.id;
        
        return {
            workFlowName: workFlowName,
            title: title,
            showAlert: skills.length > 0 ? false : true,
            installPluginMessage: installPluginMessage,
            hideGetPluginButton: productId == NAAConstant.KNOWLEDGE_PRODUCT_SYS_ID ? true : false,
            pluginUrl: pluginUrl,
            product: productName,
            monitorModalHeading: sn_i18n.Message.getMessage("sn_nowassist_admin", "Execution Errors"),
            features: features,
            summaryData: skillFamilySummaryWithLinks,
            skillData: formattedPayload,
            columnDefinitions: columnDefinitions,
            rowPayload: rowDetails,
            presentationListRowPayload: rowsData,
            monitorResultsObj: monitorResultsObj,
            defaultErrorMessage: gs.getMessage("Error occurred. Please contact administrator."),
            activateContent: gs.getMessage("Error occurred while activating skill. Please contact administrator."),
            deactivateContent: gs.getMessage("Error occurred while deactivating skill. Please contact administrator."),
            activateLoaderLabel: gs.getMessage("Activating skill"),
            deactivateLoaderLabel: gs.getMessage("Deactivating skill"),
            sessionDomain: sessionDomain,
            sessionDomainName: sessionDomainName,
            activateDifferentDomainSkillModalHeading: gs.getMessage("Activate skill in the {0} domain?", sessionDomainName),
			turnOnDifferentDomainSkillAlertMessage: sn_i18n.Message.getMessage("sn_nowassist_admin", "This skill will be enabled in the current domain scope, {domainName}.To activate in other domains, change your domain scope to the parent domain, then try activating it again.", {domainName: sessionDomainName}),
            activateDifferentDomainSkillModalDescription: gs.getMessage("You are currently in the {0} domain. Enabling this skill will only enable it for this domain.", sessionDomainName),
            activateDifferentDomainSkillModalSubDescription: gs.getMessage("If you would like to enable it in all domains within the same parent domain, you can select Cancel and change your domain scope. After you have changed your domain scope to the parent domain, then try activating the skill."),
            deActivateDifferentDomainSkillModalHeading: gs.getMessage("Deactivate skill in the {0} domain?", sessionDomainName),
            deActivateDifferentDomainSkillModalDescription: gs.getMessage("You are currently in the {0} domain. Deactivating this skill will only deactivate it for this domain.", sessionDomainName),
            deActivateDifferentDomainSkillModalSubDescription: gs.getMessage("If you would like to deactivate it in all domains within the same parent domain, you can select Cancel and change your domain scope. After you have changed your domain scope to the parent domain, then try deactivating the skill."),
            copyDifferentDomainSkillModalHeading: gs.getMessage("Make a copy of the skill in {0} domain?", sessionDomainName),
            copyDifferentDomainSkillModalDescription: gs.getMessage("You are currently in the {0} domain. Making a copy of the skill will copy a skill in current domain.", sessionDomainName),
            copyDifferentDomainSkillModalSubDescription: gs.getMessage("If you would like to copy the skill in all domains within the same parent domain, you can select Cancel and change your domain scope. After you have changed your domain scope to the parent domain, then try copying the skill."),
            editDifferentDomainSkillModalHeading: gs.getMessage("Edit skill in the {0} domain?", sessionDomainName),
            editDifferentDomainSkillModalDescription: gs.getMessage("You are currently in the {0} domain. Editing this skill will copy the skill to current domain.", sessionDomainName),
            editDifferentDomainSkillModalSubDescription: gs.getMessage("If you would like to edit the skill for all domains within the same parent domain, you can select Cancel and change your domain scope. After you have changed your domain scope to the parent domain, then try editing the skill.")
        };
    } catch (e) {
        gs.error("Failed fetch Skills for Product - " + e.toString());
        throw new Error("Failed fetch Skills for Product");
    }
}
