(function(context, pageParams, blockcontext) {
    try {
        var isNAAUser = NAARoleUtil.isNAAReadOnlyUser();
        var featureId = pageParams.featureId;
        var selectedFeature = NAAWorkFlowFeatureUtil.getFeatureById(featureId);
        var name = NAAWorkFlowFeatureUtil.getWorkflowNameByProductId(selectedFeature.parent);
        var llmContent = NAAWorkFlowFeatureUtil.getProvidersForFeature(featureId);
        var showLlm = llmContent.llm.length > 0;
        var showVAModalButton = false;
        var showVALink = false;
        var monitorModalHeading = sn_i18n.Message.getMessage("sn_nowassist_admin", "Execution Errors");
        var breadcrumbs = [{
            "label": gs.getMessage("Now Assist Features")
        }, {
            "label": name['workFlowName'],
            "href": "/now/now-assist-admin/features/" + name['id'] + "/params/t/" + Date.now(),
        }, {
            "label": selectedFeature.name
        }];

        var showFAQs;
        var showHelpfulResources;
        var monitorResultsObj = {};
        var buttonLabel;
        var faqs = NAAWorkFlowFeatureUtil.getResourcesOrFAQsForFeatures(featureId, 'faq');
        var helpfulResources = NAAWorkFlowFeatureUtil.getResourcesOrFAQsForFeatures(featureId, 'link');
        var featureName = selectedFeature.name;
        var availableSkillsTitle = NAAValidator.endsWithSkills(featureName) ? gs.getMessage("All available {0}", featureName) : gs.getMessage("All available {0} skills", featureName);
        var id = selectedFeature.id;
        var skills = NAASkillConfigUtil.getSkills(id, false);
        var formattedPayload = [];
        var imageUrl = selectedFeature.preview_image;
        var description = selectedFeature.description;
        var featureImagePayload;
        if (!gs.nil(imageUrl)) {
            featureImagePayload = {
                "background": "linear-gradient(transparent 10%, white), url(" + imageUrl + ") no-repeat",
                "width": "100%",
                "height": "8rem"
            };
        } else {
            imageUrl = selectedFeature.image_url;
            featureImagePayload = {
                "background": "linear-gradient(transparent 10%, white), url(" + imageUrl + ") no-repeat center / cover",
                "width": "100%",
                "height": "8rem"
            };
        }

        // In Conversational experience dont show the setup virtual agent link when Now Assist for VA is not installed
        var isNowAssistVAInstalled = GlidePluginManager.isActive('com.snc.nowassist_va');
        var isNowAssistSearchInstalled = GlidePluginManager.isActive('com.ais_assist');
        var CONVERSATIONAL_EXPERIENCE = 'f98eb0e9775131101b53c5ed3c5a99aa';
        var PLATFORM_SKILLS = 'a7922e639f520210f0b32e5af90a1c46';

        if (id == CONVERSATIONAL_EXPERIENCE) {
            var desc1 = gs.getMessage("Now Assist skills are a powerful addition to both AI Search and Virtual Agent, enabling you to transform existing information on your instance into effective resolutions. By incorporating Now Assist skills, you can improve customer satisfaction and boost deflection rates. Empower end users with the option to engage in a conversational approach to address their needs, providing them with a seamless and intuitive experience.");

            var searchDesc = gs.getMessage("See the ServiceNow documentation for enabling Now Assist in AI Search.");
            var aiSearchLink = gs.getMessage("Setup Now Assist in AI Search");
            var aiSearchNavigation = "<p><img title='open-link-right-fill.png' src='images/open-link-right-fill.png' width='12' height='12' /> <a title='Setup Now Assist in AI Search' href='/now/now-assist-ui/setup' target='_blank' rel='noopener noreferrer nofollow'>" + aiSearchLink + "</a></p>";

            var vaDesc = gs.getMessage("After you activate Conversational Experience skills, you can set up Now Assist in Virtual Agent from the Conversational Interfaces console.");
            var vaLink = gs.getMessage("Setup Now Assist in Virtual Agent");
            var vaNavigation = "<p><img title='open-link-right-fill.png' src='images/open-link-right-fill.png' width='12' height='12' /> <a title='Setup Now Assist in Virtual Agent' href='/now/conversation/settings/assistants' target='_blank' rel='noopener noreferrer nofollow'>" + vaLink + "</a></p>";

            if ((!isNowAssistVAInstalled && !isNowAssistSearchInstalled) || isNAAUser) {
                description = "<p>" + desc1 + "</p>";
            } else if (!isNowAssistVAInstalled && isNowAssistSearchInstalled) {
                description = "<p>" + desc1 + "<br></br>" + searchDesc + "<br>" + aiSearchNavigation + "</p>";
            } else if (isNowAssistVAInstalled && !isNowAssistSearchInstalled) {
                description = "<p>" + desc1 + "<br></br>" + vaDesc + "<br>" + vaNavigation + "</p>";
            }
        }

        if (id == PLATFORM_SKILLS && isNAAUser) {
            var desc_p1 = sn_i18n.Message.getMessage("sn_nowassist_admin", "Platform skills are generative AI-powered capabilities for the Now Assist Panel. They help agents and admins work faster in the ServiceNow Platform.");
            var desc_p2 = sn_i18n.Message.getMessage("sn_nowassist_admin", "After you activate the Now Assist panel knowledge search source, you can edit and configure which knowledge articles will be used to synthesize and generate answers.");
            description = "<p>" + desc_p1 + "<br></br>" + desc_p2 + "</p>";
        }

        skills.forEach(function(skill) {
            var id = skill.id;
            var {
                override_config
            } = NAASkillConfigUtil.getSkillConfigUIInfo(id);

            buttonLabel = override_config?.activateSkillProps?.label || gs.getMessage('Activate skill');
            buttonAriaConfig = gs.getMessage('Activate skill for {0}', skill.label);
            var skillDetails = NAASkillConfigUtil.getSkillConfigStateDetails(id);
            var state = skillDetails.state;
            var highlightLabel;
            var colour;
            var res = NAASkillConfigUtil.getSkillDetails(state);
            highlightLabel = res['label'];
            colour = res['colour'];
            var label = skill.label;
            var description = skill.description;
            if (!skill.has_var_set) {
                buttonLabel = gs.getMessage('Turn on');
                buttonAriaConfig = gs.getMessage('Turn on skill for {0}', skill.label);
            }

            var moreActionsItems = [];
            if (skill.can_write) {
                if (skill.is_template && !skill.edited_in_nask) {
                    moreActionsItems.push({
                        id: "duplicate",
                        skillId: skill.id,
                        skillName: label,
                        domain: skill.sys_domain,
                        label: gs.getMessage("Make a copy")
                    });
                }
                //Add Troubleshoot action when Now Assist Diagnostics Plugin is installed 
                if (NAAPluginUtil.isNowAssistDiagnosticsPluginInstalled()) {
                    var diagn_util = new sn_nowassist_diagn.NowAssistAdminDiagnosticUtil();
                    if ((diagn_util.getDiagnosticScriptArr(skill.id)).length > 0) {
                        moreActionsItems.push({
                            id: "troubleshoot",
                            skillId: skill.id,
                            skillName: label,
                            domain: skill.sys_domain,
                            label: gs.getMessage("Run diagnostics")
                        });
                    }
                    var monitoringLogs = diagn_util.getMonitoringLogs ? diagn_util.getMonitoringLogs(skill.id) : [];
                    if (monitoringLogs.length > 0) {
                        var monitorResultsData = {
                            items: monitoringLogs,
                            count: sn_i18n.Message.getMessage("sn_nowassist_admin", "Total ({count})", {
                                count: monitoringLogs.length.toString()
                            }),
                            subHeading: sn_i18n.Message.getMessage("sn_nowassist_admin", "Below are the monitoring results for the skill, {skillName}", {
                                skillName: label
                            })
                        }
                        monitorResultsObj[skill.id] = monitorResultsData;
                        moreActionsItems.push({
                            id: "monitor_errors",
                            skillId: skill.id,
                            skillName: label,
                            domain: skill.sys_domain,
                            label: sn_i18n.Message.getMessage("sn_nowassist_admin", "View Execution Errors")
                        });
                    }
                }
            }

            var provider = NAAGenAIUtil.getProviderForSkillConfig(id);
            var providerNames = provider?.skillConfigLlmNames;
            var providerLabel = providerNames ?? "";
            var providerSet = provider?.skillConfigLlmSet;

            var modelAvailabilityResult = {};
            if( providerSet?.size === 0 || providerSet.size === 1 && providerSet.has("Now LLM") ) {
                modelAvailabilityResult = {
                    status: "Success",
                    modelAvailable: true
                };
            } else {
                modelAvailabilityResult = NAAGenAIUtil._isModelAvailable(id, provider);
            }

            formattedPayload.push({
                "id": id,
                "has_var_set": skill.has_var_set,
                "nap_skill_applicability": skill.nap_skill_applicability,
                "success_message": gs.getMessage('{0}', skill.success_message),
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
                "highlightedText": !gs.nil(skill.type) && skill.type === "custom" ? [{
                        "visibility": true,
                        "label": "Custom",
                        "color": "magenta"
                    },
                    {
                        "visibility": true,
                        "label": highlightLabel,
                        "color": colour
                    },
                    {
                        "visibility": providerLabel !== "",
                        "label": providerLabel,
                        "color": "low"
                    }
                ] : [{
                    "visibility": true,
                    "label": highlightLabel,
                    "color": colour
                }, {
                    "visibility": providerLabel !== "",
                    "label": providerLabel,
                    "color": "low"
                }],
                "action": {
                    "variant": override_config?.activateSkillProps?.variant || "secondary",
                    "label": buttonLabel,
                    "disabled": skill.can_write != true || Boolean(override_config?.activateSkillProps?.disable) || (modelAvailabilityResult.status === "Success" ? !(modelAvailabilityResult.modelAvailable) : true),
                    "icon": "",
                    "visibility": featureId == "eaac4f3d53303110453cddeeff7b1266" ? false : true,
                    "configAria": {
                        "aria-label": buttonAriaConfig
                    },
                    "toolTipMsg": override_config?.activateSkillProps?.toolTipMsg
                },
                "activateModal": {
                    "heading": override_config?.successModalProps?.headerText,
                    "description": override_config?.successModalProps?.successMessage,
                    "buttons": override_config?.successModalProps?.buttons
                },
                "moreActions": moreActionsItems.length > 0 ? {
                    "visibility": ( modelAvailabilityResult.status === "Success" ? modelAvailabilityResult.modelAvailable : false ),
                    "variant": "secondary",
                    "items": moreActionsItems,
                    "configAria": {}
                } : {},
                "footer": modelAvailabilityResult.status.toLowerCase() === "error" ? ({
                    "visibility": true,
                    "icon": "exclamation-triangle-outline",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Error while checking skill availability."),
                    "buttonLabel": false,
                    "buttonDisabled": true
                }) : {
                    "visibility": !modelAvailabilityResult.modelAvailable,
                    "icon": false,
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "The skill is unavailable in this region. To learn more and enable, click "),
                    "buttonLabel": sn_i18n.Message.getMessage("sn_nowassist_admin", "here."),
                    "buttonDisabled": skill.can_write != true

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
                "edited_in_nask_header": skill.edited_in_nask_header
            });

        });

        var activeSkillsData = NAASkillConfigUtil.getActiveSkillsPresentationListData(featureId);
        monitorResultsObj = { ...monitorResultsObj,
            ...activeSkillsData.monitorResultsObj
        };
        var activeSkillDesc;
        if (activeSkillsData.rowsData.rows.length > 0) {
            activeSkillsData.show_active_skills_list = true;
            activeSkillsData.show_active_skills_empty_state = false;
            activeSkillDesc = gs.getMessage("The following skills have been activated:");
        } else {
            activeSkillsData.show_active_skills_list = false;
            activeSkillsData.show_active_skills_empty_state = true;
            activeSkillDesc = gs.getMessage("No skills to display yet.");
        }

        if (featureId == 'f98eb0e9775131101b53c5ed3c5a99aa')
            showVAModalButton = true;

        var nowassistVAPluginAvailable = NAAPluginUtil.isNowassistVAPluginInstalled();
        if (featureId == 'f98eb0e9775131101b53c5ed3c5a99aa' && nowassistVAPluginAvailable)
            showVALink = true;

        var sessionDomain = gs.getSession().getCurrentDomainID();
        var sessionDomainName = "";

        if (sessionDomain) {
            sessionDomainName = NAADomainUtil.getDomainName(sessionDomain);
        } else {
            sessionDomain = "global";
            sessionDomainName = "Global";
        }

        var alertMessageFeatureName = NAAValidator.endsWithSkills(featureName) ? featureName.split(' ').slice(0, -1).join(' ') : featureName;

        return {
            title: featureName,
            description: gs.nil(description) ? ' ' : description,
            availableSkillsTitle: availableSkillsTitle,
            skillsCardPayload: formattedPayload,
            monitorResultsObj: monitorResultsObj,
            monitorModalHeading: monitorModalHeading,
            featureImagePayload: featureImagePayload,
            breadcrumbs: breadcrumbs,
            product: name['productName'],
            columnsData: activeSkillsData.columnsData,
            rowsData: activeSkillsData.rowsData,
            active_skills_description: activeSkillDesc,
            show_active_skills_list: activeSkillsData.show_active_skills_list,
            show_active_skills_empty_state: activeSkillsData.show_active_skills_empty_state,
            show_inactive_skills: skills.length > 0,
            show_no_skills_alert: (skills.length == 0 && activeSkillsData.rowsData.rows.length == 0),
            alert_message: gs.getMessage("You need at least one product plugin to be installed to unlock {0} skill(s) ", alertMessageFeatureName),
            turn_off: gs.getMessage("Turn off "),
            turn_off_message: gs.getMessage("This will turn off the skill for your users."),
            activateLoaderLabel: gs.getMessage("Activating skill"),
            deactivateLoaderLabel: gs.getMessage("Deactivating skill"),
            duplicatingSkillLoaderLabel: gs.getMessage("Duplicating Skill"),
            overrideSkillLoaderLabel: gs.getMessage("Overriding Skill"),
            defaultErrorMessage: gs.getMessage("Error occurred. Please contact administrator."),
            activateContent: gs.getMessage("Error occurred while activating skill. Please contact administrator."),
            deactivateContent: gs.getMessage("Error occurred while deactivating skill. Please contact administrator."),
            faqs: faqs,
            helpfulResources: helpfulResources,
            showFAQs: faqs.length > 0,
            showHelpfulResources: helpfulResources.length > 0,
            showVAModalButton: showVAModalButton,
            showVALink: showVALink,
            errorOccured: false,
            noErrorOccured: true,
            sessionDomain: sessionDomain,
            sessionDomainName: sessionDomainName,
            showIncludedInLicenseLabel: selectedFeature.category !== "custom",
            activateDifferentDomainSkillModalHeading: gs.getMessage("Activate skill in the {0} domain?", sessionDomainName),
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
        gs.error("Error on skill page " + JSON.stringify(e));
        return {
            errorOccured: true,
            noErrorOccured: false
        };
    }

})(context, pageParams, blockcontext);
