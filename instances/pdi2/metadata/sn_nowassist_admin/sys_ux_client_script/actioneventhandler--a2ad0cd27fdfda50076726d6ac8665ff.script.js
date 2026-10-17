/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */



async function handler({
    api,
    event,
    helpers,
    imports
}) {
    
    const eventName = event.name;
    const eventPayload = event.payload;
    const eventContext = event.context?.item?.value;
    const domain = api.state.sessionDomain;
    
    switch (event.elementId) {
        case 'alert_1':
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: api.state.pluginUrl,
                    target: "_self"
                },
                reload: true
            });
            break;
        case "fetch_allowed_providers":
            var allowedProviders=eventPayload?.data?.output?.output?.providers?.filter(item => item.allowed)?.map(item=>item.label)?.join(", ");
            var text= await helpers.translate("Per updated policy, approved model providers are {0}. Fallback is turned off.",allowedProviders);
            api.setState("bulkDeactivationModalTitles",{...api.state.bulkDeactivationModalTitles,alert:text});
            break;
        case "deactivate_non_complaint_skills_button":
            var skillListData= api.state.nonComplaintSkills.rows.map(item=>{return {id:item.key,domain:item.domain}});
            api.data.deactivate_non_complaint_skills.execute({skills:skillListData});
            break;
        case "deactivate_non_complaint_skills":
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "successfull_bulk_deactivation",
                    status: "info",
                    icon: "circle-info-outline",
                    content: {
                        type: "html",
                        value: await helpers.translate(`{0} non-compliant skills deactivated.`,api.state.nonComplaintSkills.rows.length)
                    },
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
            api.setState("nonComplaintSkills",{rows:[]});            
            break;
        case "activate_domain_confirm_button":
            helpers.modal.close('activate_domain_separation_modal');
            duplicateSkill(api.state.duplicateSkillId, onSuccessfullSkillDuplicateForActivate, true, api.state.sessionDomain);
            break;
        case "deactivate_domain_separation_confirm":
            duplicateSkill(api.state.selectedSkillConfigIdForDeactivation, onSuccessfulDeactivateSkillDuplicate, true, api.state.sessionDomain);
            helpers.modal.close('deactivate_domain_separation');
            break;

        case "deactivate_confirm_button":
            await api.data.save_skill_feedback_1.execute({
            additionalFeedback: api.state.additionalFeedback,
            feedbackChecklist: api.state.feedbackChecklist,
            skillId: api.state.selectedSkillConfigIdForDeactivation
            });
            updateSkillState("DEACTIVATE_SKILL_CONFIG", api.state.selectedSkillConfigIdForDeactivation, false, api.state.deactivateLoaderLabel);
            helpers.modal.close('turn_off_skill_modal');
            break;

        case "duplicate_skill":
            duplicateSkill(api.state.duplicateSkillId, onSuccessfulSkillDuplicate);
            helpers.modal.close('duplicate_skill');
            break;

        case "duplicate_domain_confirm_button":
            duplicateSkill(api.state.duplicateSkillId, onSuccessfulSkillDuplicate, true, api.state.sessionDomain);
            helpers.modal.close('duplicate_different_domain_skill_modal');
            break;

        case "edit_different_domain_skill_confirm":
            duplicateSkill(api.state.duplicateSkillId, onSuccessfulEditSkillDuplicate, true, api.state.sessionDomain);
            helpers.modal.close("edit_different_domain_skill_modal");
            break;

        case "edited_oob_confirm_button":
            await api.data.translate_modal_contents_1.execute({
                modalTitle: api.state.modalTile,
                modalSubtitle: api.state.modalSubtitle,
                product: api.state.product,
                feature: api.state.selectedSkillForActivation?.skillFeature
            });

            updateSkillState("ACTIVATE_SKILL_CONFIG", api.state.selectedSkillForActivation.id, true, api.state.activateLoaderLabel);

            helpers.modal.close('edited_skill_alert');
            break;

        case "skill_action_button":
            api.setState("skill_associatedCapabilityAndGenAiProviderMap", eventContext.associatedCapabilityAndGenAiProviderMap);
            api.data.check_for_skill_using_websearch_and_gemini_1.refresh();
            api.setState('selectedSkillConfigIdForDeactivation', eventContext.id);
            if (eventContext.action.type == "deactivate") {
                if (domain !== eventContext.domain) {
                    api.setState('duplicateSkillId', eventContext.id);
                    api.setState('duplicateSkill', eventContext);
                    helpers.modal.open('deactivate_domain_separation');
                } else {

                    api.setState('modalSubtitle', eventContext.success_message);
                    api.setState('modalTitle', eventContext.title.label);
                    helpers.modal.open('turn_off_skill_modal');
                }

            } else {
                if (domain !== eventContext.domain) {
                    api.setState('duplicateSkillId', eventContext.id);
                    api.setState('duplicateSkill', eventContext);
                    api.setState('isDifferentDomain', true);
                    // For Turn-On Skills
                    if(!eventContext.has_var_set) {
                        api.setState('activateDifferentDomainSkillModalDescription', await helpers.translate("You are currently in the {0} domain. To enable the skill only for this domain, select \"Yes Activate\". This will override the skill.", api.state.sessionDomainName))
                        api.setState("edit_access_skill_data", {
                            "allowEditingRMRoles": eventContext.allowEditingRMRoles,
                            "skillName": eventContext.title.label + " for " + api.state.sessionDomainName,
                            "parent": eventContext.parent
                        });
                    } else {
                        api.setState('activateDifferentDomainSkillModalDescription', api.state.allSkillData.activateDifferentDomainSkillModalDescription);
                    }
                    helpers.modal.open('activate_domain_separation_modal');
                } else {
                    if (!eventContext.has_var_set) {

                        // Get ACL roles for skill config
                        api.setState('duplicateSkillId', eventContext.id);
                        api.setState("edit_access_skill_data", {
                            "allowEditingRMRoles": eventContext.allowEditingRMRoles,
                            "skillName": eventContext.title.label,
                            "parent": eventContext.parent
                        });
                        api.data.get_acl_data_for_skill_config_1.refresh();
                        api.data.get_role_masking_data_for_skill_config_1.refresh();

                        api.setState('modalTitle', eventContext.title.label);
                        // Keeping it static - Will get changed dynamically
                        api.setState('modalSubtitle', eventContext.success_message);
                        api.setState('activateSkillModalHeading ', eventContext.activateModal.heading);
                        api.setState('activateSkillModalFooterButtons ', eventContext.activateModal.buttons || []);

                        if (eventContext.edited_in_nask) {
                            api.setState('selectedSkillForActivation ', eventContext.item);
                            // helpers.modal.open('edited_skill_alert');
                            helpers.modal.open('turn_on_edit_access_modal');
                        } else {
                            await api.data.translate_modal_contents_1.execute({
                                modalTitle: eventContext?.title?.label,
                                modalSubtitle: eventContext.success_message,
                                product: api.state.product,
                                feature: eventContext.skillFeature
                            });
                            // Open define access modal
                            api.setState('isSkillActive', false);
                            helpers.modal.open('turn_on_edit_access_modal');
                            api.setState('addSelectedRoles', []);
                            api.setState('addSelectRolesRadioSelected', false);

                        }
                    } else {
                        navigateToGuidedSetupPage(eventContext.id);
                    }
                }
            }
            trackUsage("Activate skill clicked", {
                card: "Skill",
                skill: eventContext?.title?.label,
                feature: eventContext?.skillFeature,
                product: api.state.product,
                workflow: api.state.workflow
            });
            break;
        case "select_llm_button":
            api.setState('skillId', eventContext.id);
            api.setState("skillProviderIds", eventContext.skillProviderIds);
            api.setState('skillProvider', eventContext.skillProvider);
            api.data.switch_to_now_llm_check_1.execute({
                skillConfigId: eventContext.id
            });

            break;
        case "dropdown_1":
            if (eventPayload.item.id == 'duplicate') {
                api.setState('duplicateSkillId', eventPayload.item.skillId);
                api.setState('duplicateSkillName', eventPayload.item.skillName);

                if (eventPayload.item.domain !== api.state.sessionDomain) {
                    helpers.modal.open("duplicate_different_domain_skill_modal");
                } else {
                    helpers.modal.open('duplicate_skill');
                }
            } else if (eventPayload.item.id == 'troubleshoot') {
                api.setState('troubleshootSkillId', eventPayload.item.skillId);
                api.setState('troubleshootSkillName', eventPayload.item.skillName);
                api.setState('showTroubleshootLoading', true);
                api.setState('showTroubleshootResult', false);
                api.setState('showEmptyResult', false);
                api.setState('troubleshootErrorOccured', false);
                helpers.modal.open("troubleshoot_modal");
                api.data.troubleshoot_block_1.execute({
                    troubleshootSkillId: eventPayload.item.skillId,
                    troubleshootSkillName: eventPayload.item.skillName
                });
            } else if (eventPayload.item.id == 'monitor_errors') {
                api.setState('monitorResults', api.state.monitorResultsObj[eventPayload.item.skillId] || []);
                helpers.modal.open("monitor_modal");
            } else if (eventPayload.item.id == 'edit') {
                if (eventPayload.item.domain !== domain) {
                    api.setState('duplicateSkillId', eventPayload.item.skillId);
                    api.setState('duplicateSkillName', eventPayload.item.skillName);
                    helpers.modal.open("edit_different_domain_skill_modal");
                } else {
                    navigateToGuidedSetupPage(eventPayload.item.skillId);
                }
            } else if (eventPayload.item.id == 'edit_access') {
                api.setState('duplicateSkillId', eventPayload.item.skillId);
                api.setState('isSkillActive', true);
                api.setState("edit_access_skill_data", {
                    "allowEditingRMRoles": eventContext.allowEditingRMRoles,
                    "skillName": eventContext.title.label,
                    "parent": eventContext.parent
                });
                api.data.get_acl_data_for_skill_config_1.refresh();
                api.data.get_role_masking_data_for_skill_config_1.refresh();
                helpers.modal.open('turn_on_edit_access_modal');
                api.setState('addSelectedRoles', []);
                api.setState('addSelectRolesRadioSelected', false);
            }
            break;

        case "presentational_list_1":
            var skillName = "";
            var skillId = "";
            var skillInfo;
            switch (eventName) {
                case "NOW_LIST#CONTEXT_ACTION_CLICKED":
                    if (eventPayload.context.rows) { //vancouver
                        skillName = eventPayload.context.rows[0].cells.name.value;
                        skillId = eventPayload.context.rows[0].key;
                        skillInfo = eventPayload.context.rows[0].skillInfo;
                    } else { //utah
                        skillName = eventPayload.context.row.cells.name.value;
                        skillId = eventPayload.context.row.key;
                        skillInfo = eventPayload.context.row.skillInfo;
                    }
                    switch (eventPayload.actionItem.id) {
                        case 'edit':
                            if (eventPayload.context.rows[0].cells.name.domain !== domain) {
                                api.setState('duplicateSkillId', eventPayload.context.rows[0].cells.name.id);
                                api.setState('duplicateSkillName', eventPayload.context.rows[0].cells.name.value);
                                helpers.modal.open("edit_different_domain_skill_modal");
                            } else {
                                navigateToGuidedSetupPage(eventPayload.context.rows[0].cells.name.id);
                            }
                            break;
                        case 'duplicate':
                            api.setState('duplicateSkillId', eventPayload.context.rows[0].cells.name.id);
                            api.setState('duplicateSkillName', eventPayload.context.rows[0].cells.name.value);

                            if (eventPayload.context.rows[0].cells.name.domain !== domain) {
                                helpers.modal.open("duplicate_different_domain_skill_modal");
                            } else {
                                helpers.modal.open('duplicate_skill');
                            }
                            break;
                        case 'troubleshoot':
                            api.setState('troubleshootSkillId', eventPayload.context.rows[0].cells.name.id);
                            api.setState('troubleshootSkillName', eventPayload.context.rows[0].cells.name.value);
                            api.setState('showTroubleshootLoading', true);
                            api.setState('showTroubleshootResult', false);
                            api.setState('showEmptyResult', false);
                            api.setState('troubleshootErrorOccured', false);
                            helpers.modal.open("troubleshoot_modal");
                            api.data.troubleshoot_block_1.execute({
                                troubleshootSkillId: eventPayload.context.rows[0].cells.name.id,
                                troubleshootSkillName: eventPayload.context.rows[0].cells.name.value
                            });
                            break;
                        case 'monitor_errors':
                            api.setState('monitorResults', api.state.monitorResultsObj[eventPayload.context.rows[0].cells.name.id] || []);
                            helpers.modal.open("monitor_modal");
                            break;
                        case 'edit_access':
                            api.setState('duplicateSkillId', eventPayload.context.rows[0].cells.name.id);
                            api.setState("edit_access_skill_data", {
                                "allowEditingRMRoles": skillInfo.allowEditingRMRoles,
                                "skillName": skillInfo.title.label,
                                "parent": skillInfo.parent
                            });
                            api.data.get_acl_data_for_skill_config_1.refresh();
                            api.data.get_role_masking_data_for_skill_config_1.refresh();
                            api.setState('isSkillActive', true);
                            helpers.modal.open('turn_on_edit_access_modal');
                            api.setState('addSelectedRoles', []);
                            api.setState('addSelectRolesRadioSelected', false);
                            break;
                    }
                    break;
                case "NOW_LIST#CUSTOM_COMPONENT_ACTION_DISPATCHED":
                    switch (event.payload.detail.type) {
                        case "NOW_BUTTON#CLICKED":
                            var skillContext = event.payload?.cellContext?.row?.cells?.name;
                            var skillInfo = eventPayload?.cellContext?.row?.skillInfo;
                            skillId = skillContext?.id;
                            skillName = skillContext?.value;
                            switch (eventPayload.cellContext.cell.componentProps.id) {
                                case "activate":
                                    if (domain !== skillContext.domain) {
                                        api.setState('duplicateSkillId', skillId);
                                        api.setState('duplicateSkill', skillName);
                                        if(!skillContext.has_var_set){
                                            api.setState('activateDifferentDomainSkillModalDescription', await helpers.translate("You are currently in the {0} domain. To enable the skill only for this domain, select \"Yes Activate\". This will override the skill.", api.state.sessionDomainName))
                                            api.setState("edit_access_skill_data", {
                                                "allowEditingRMRoles": skillInfo.allowEditingRMRoles,
                                                "skillName": skillInfo.title.label + " for " + api.state.sessionDomainName,
                                                "parent": skillInfo.parent
                                            });
                                        } else {
                                            api.setState('activateDifferentDomainSkillModalDescription', api.state.allSkillData.activateDifferentDomainSkillModalDescription);
                                        }
                                        helpers.modal.open('activate_domain_separation_modal');
                                    } else {
                                        if (!eventPayload.cellContext.row.skillInfo.has_var_set) {
                                            api.setState('duplicateSkillId', skillId);
                                            api.setState("edit_access_skill_data", {
                                                "allowEditingRMRoles": skillInfo.allowEditingRMRoles,
                                                "skillName": skillInfo.title.label,
                                                "parent": skillInfo.parent
                                            });
                                            api.data.get_acl_data_for_skill_config_1.refresh();
                                            api.data.get_role_masking_data_for_skill_config_1.refresh();
                                            api.setState('modalTitle', skillContext.label);
                                            // Keeping it static - Will get changed dynamically
                                            api.setState('modalSubtitle', eventPayload.cellContext?.row?.skillInfo?.success_message);
                                            api.setState('activateSkillModalHeading ', eventPayload?.cellContext?.row?.skillInfo?.activateModal?.heading);
                                            api.setState('activateSkillModalFooterButtons ', eventPayload?.cellContext?.row?.skillInfo?.activateModal?.buttons || []);

                                            if (eventPayload.cellContext.row.skillInfo.edited_in_nask) {
                                                api.setState('selectedSkillForActivation ', eventPayload?.cellContext?.row?.skillInfo);
                                                // helpers.modal.open('edited_skill_alert');
                                                helpers.modal.open('turn_on_edit_access_modal');
                                            } else {
                                                await api.data.translate_modal_contents_1.execute({
                                                    modalTitle: skillContext.label,
                                                    modalSubtitle: eventPayload?.cellContext?.row?.skillInfo?.success_message,
                                                    product: api.state.product,
                                                    feature: eventPayload.cellContext?.row?.skillInfo?.skillFeature
                                                });
                                                api.setState('isSkillActive', false);
                                                helpers.modal.open('turn_on_edit_access_modal');
                                                api.setState('addSelectedRoles', []);
                                                api.setState('addSelectRolesRadioSelected', false);

                                            }
                                        } else {
                                            navigateToGuidedSetupPage(eventPayload?.cellContext?.row?.key);
                                        }
                                    }
                                    trackUsage("Activate skill clicked", {
                                        card: "Skill",
                                        skill: skillContext.label,
                                        feature: eventPayload?.cellContext?.row?.skillInfo?.skillFeature,
                                        product: api.state.product,
                                        workflow: api.state.workflow
                                    });

                                    break;
                                case "deactivate":
                                    api.setState('selectedSkillConfigIdForDeactivation', skillId);
                                    if (domain !== skillContext.domain) {
                                        api.setState('duplicateSkillId', skillId);
                                        api.setState('duplicateSkill', skillName);
                                        helpers.modal.open('deactivate_domain_separation');
                                    } else {

                                        api.setState('modalSubtitle', eventPayload.cellContext.row.skillInfo.success_message);
                                        api.setState('modalTitle', skillContext.label);
                                        helpers.modal.open('turn_off_skill_modal');
                                    }
                                    break;
                            }
                            break;
                        case "NOW_BUTTON_BARE#CLICKED":
                            api.setState('popover', {});
                            api.data.switch_to_now_llm_check_1.execute({
                                skillConfigId: api.state.skillId
                            });
                            break;
                        case "NOW_BUTTON_ICONIC#CLICKED":
                            var modelAvailableResult = eventPayload?.cellContext?.row?.skillInfo?.modelAvailableResult;
                            var popoverContent = {};

                            if (!(modelAvailableResult.status === "Success" ? modelAvailableResult.modelAvailable : false)) {
                                popoverContent = modelAvailableResult.status.toLowerCase() === "error" || eventPayload.cellContext.row.skillInfo.action.type === "deactivate" ? {
                                        popoverType: "custom",
                                        componentTag: "now-stylized-text",
                                        defaultComponentProps: {
                                            text:modelAvailableResult.status.toLowerCase() === "error" ? await helpers.translate("Error while checking skill availability.") : await helpers.translate("Since the skill is currently active but unavailable in this region, the data processing location for Gen AI requests changes from the Asia-Pacific and Japan (APJ) region to a global location. Your ServiceNow instance location remains APJ, and only Gen AI processing is affected. You can deactivate the skill to avoid any traffic shifts."),
                                            tag: "div",
                                            css: "{max-width: 500px}"
                                        }
                                    } : {
                                        popoverType: "custom",
                                        componentTag: "now-button-bare",
                                        defaultComponentProps: {
                                            label: await helpers.translate("The skill is unavailable in this region. To learn more and enable, click here."),
                                            size: "sm",
                                            disabled: api.data.nowassistadminuser_1.output
                                        },
                                        customCellEmittedActions: [
                                            "NOW_BUTTON_BARE#CLICKED"
                                        ]
                                }
                            }
                            else if(eventPayload?.cellContext?.row?.skillInfo?.showLTSRemovedAlert){
                                popoverContent = {
                                        popoverType: "custom",
                                        componentTag: "now-stylized-text",
                                        defaultComponentProps: {
                                            text: await helpers.translate("The skill is using an unsupported model provider. Please contact AI steward to update."),
                                            tag: "div",
                                            css: "{max-width: 500px}"
                                        }
                                }

                            }
                            else {
                               popoverContent = {
                                        popoverType: "custom",
                                        componentTag: "now-stylized-text",
                                        defaultComponentProps: {
                                            text:eventPayload.cellContext.row.skillInfo.action.type === "deactivate" ? await helpers.translate("The skill is using an non-compliant model provider. Review policy to see list of approved providers") : await helpers.translate("The skill is disabled as it is not compliant per your model provider policy. Please review policy for details"),
                                            tag: "div",
                                            css: "{max-width: 500px}"
                                        }
                                }
                            }

                            api.setState('skillId', event.payload?.cellContext?.row?.cells?.name?.id);
                            api.setState('skillProvider', eventPayload?.cellContext?.row?.skillInfo?.skillProvider);
                            var rowIndex = api.state.isEnabledRowDefinitions.rows.findIndex(obj => obj.key === eventPayload?.cellContext?.row?.key);
                            
                            var popover = {
                                target: {
                                    rowIndex: rowIndex + 1,
                                    cellIndex: 2
                                },
                                config: {
                                    positions: [{
                                        target: 'top-center',
                                        content: 'bottom-center'
                                    }]
                                },
                                content: popoverContent
                            }
                            api.setState('popover', popover);

                            break;
                    }
                    break;
            }
            break;
        case 'select_masking_roles':
            var rmRoles = event.payload.value;
            let roleMaskingList = {...api.state.roleMaskingList};
            roleMaskingList.roles = rmRoles;
            api.setState('roleMaskingList', roleMaskingList);
            api.setState('disableTurnOn', roleMaskingList.allowAllSessionRoles ? false : !rmRoles?.length);
            break;
        case 'cancel_button':
            helpers.modal.close('turn_on_edit_access_modal');
            break;
        case 'turn_on_button':
            helpers.modal.close('turn_on_edit_access_modal');
            if(api.state.edit_access_skill_data.allowEditingRMRoles) {
                api.data.upsert_roles_for_role_masking_1.execute({payload: {
                        skillConfigId: api.state.duplicateSkillId,
                        skillName: api.state.edit_access_skill_data.skillName,
                        roleMaskingList: api.state.roleMaskingList
                }});
            }
            if(!api.state.isSkillActive)
                updateSkillState("ACTIVATE_SKILL_CONFIG", api.state.duplicateSkillId, true, api.state.activateLoaderLabel);
            break;
        case 'add_acl_button':
            api.setState('showAclData', false);
            api.setState('showAddAclData', true);
            api.setState('showEditAclData', false);
            break;
        case 'add_acl_cancel_button':
            helpers.modal.close('turn_on_edit_access_modal');
            api.setState('addSelectedRoles', []);
            api.setState('addSelectRolesRadioSelected', false);
            break;
        case 'edit_acl_cancel_button':
            helpers.modal.close('turn_on_edit_access_modal');
            break;
        case 'add_acl_save_button':
            // Add data broker to create ACL
            api.data.create_allow_acl_for_skill_config_1.execute({
                skill_config: api.state.duplicateSkillId,
                acl_data: {
                    roles: api.state.addSelectRolesRadioSelected ? api.state.addSelectedRoles.map(item => item.id) : [],
                    decisionType: "allow",
                    securityAttribute: api.state.addSelectRolesRadioSelected ? false : true
                }
            });
            api.setState('showAclData', false);
            api.setState('showAddAclData', false);
            api.setState('showEditAclData', false);
            break;
        case 'edit_acl_save_button':
            if(api.state.selectRolesRadioSelected){
            api.data.update_roles_for_acl_1.execute({
                acl_data :api.state.selectedAclData});
            }
            else {
                var selectedACLData = api.state.selectedAclData;
                selectedACLData.roles = [];
                selectedACLData.securityAttribute = true;
                selectedACLData.decisionType = "allow";
                api.data.update_roles_for_acl_1.execute({acl_data : selectedACLData});
                api.setState('selectedAclData', selectedACLData);
            }
            api.setState('showAclData', false);
            api.setState('showAddAclData', false);
            api.setState('showEditAclData', false);
            break;
            
        case 'add_select_roles':
            api.setState('addSelectedRoles', event.payload.value);
            break;
        case 'select_roles':
            var roles = event.payload.value;
            api.setState('selectedRoles', roles);
            var selectedACLData = api.state.selectedAclData;
            selectedACLData.roles = roles.map(item => item.id);
            api.setState('selectedAclData', selectedACLData);
            break;
            break;
        case "presentational_list_2":
            var roles = event?.payload?.cellContext?.row?.cells?.roles?.componentProps?.pills?.filter(item => item?.pillValue !== 'any').map(({
                pillValue,
                pillText
            }) => ({
                id: pillValue,
                label: pillText
            }));
            api.setState('selectedAclData', { id: event?.payload?.cellContext?.row?.key,
            roles: roles.map(item => item.id),
            securityAttribute: false,
            aclScopeData: event.payload?.cellContext?.row?.aclScopeData,
            decisionType: "allow",
            skill_config: api.state.duplicateSkillId});
            api.setState('selectRolesRadioSelected', !event?.payload?.cellContext?.row?.cells?.roles?.componentProps?.pills?.some(item => item?.pillValue === 'any'));
            api.setState('selectedRoles', roles);
            api.setState('showAclData', false);
            api.setState('showAddAclData', false);
            api.setState('showEditAclData', true);
            break;
        case "checklist_options":
            updateFeedbackChecklist(eventPayload);
            break;
        case "additional_feedback":
            api.setState('additionalFeedback',event?.payload?.value);
            break;
        case "domain_checklist_option":
            updateFeedbackChecklist(eventPayload);
            break;
        case "domain_additional_feedback":
            api.setState('additionalFeedback',event?.payload?.value);
            break;
    }

    function updateFeedbackChecklist(checklistEventPayload) {
        const clData = [...api.state.feedbackChecklist];
        clData.find((item, i) => {
            if (item.itemId === checklistEventPayload.itemId) {
                clData[i] = {
                    ...clData[i],
                    checked: checklistEventPayload.checked
                };
                return true;
            }
        });
        api.setState('feedbackChecklist', clData);

    }

    function navigateToGuidedSetupPage(skillConfigId) {
        navigateToPage({
            route: 'skill-guided-setup',
            fields: {
                "skillConfig": skillConfigId
            }
        }, true);
    }


    function navigateToPage(navPayload, reload = false) {
        api.emit("NAV_ITEM_SELECTED", {
            reload: reload,
            ...navPayload
        });
    }

    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }

    function onSuccessfulDeactivateSkillDuplicate(response) {
        api.data.save_skill_feedback_1.execute({
        additionalFeedback: api.state.additionalFeedback,
        feedbackChecklist: api.state.feedbackChecklist,
        skillId: response.response.result.newSkillConfigId
        });
        updateSkillState("DEACTIVATE_SKILL_CONFIG", response.response.result.newSkillConfigId, false, api.state.deactivateLoaderLabel);
    }

    function onSuccessfulEditSkillDuplicate(response) {
        navigateToGuidedSetupPage(response.response.result.newSkillConfigId);
    }

    async function onSuccessfullSkillDuplicateForActivate(response) {
        if (response.response.result.hasVarSet) {
            navigateToGuidedSetupPage(response.response.result.newSkillConfigId);
        } else {
            api.setState('duplicateSkillId', response.response.result.newSkillConfigId);
            api.data.get_acl_data_for_skill_config_1.refresh();
            api.data.get_role_masking_data_for_skill_config_1.refresh();
            helpers.modal.open('turn_on_edit_access_modal');
        }
    }


    async function onSuccessfulSkillDuplicate(response) {
        if (response.response.result.hasVarSet) {
            navigateToGuidedSetupPage(response.response.result.newSkillConfigId);
        } else {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: true,
                label: "Loading",
                action: null,
                nonBlocking: false
            });
            await api.data.get_skill_data_for_product_1.execute({
                product_id: api.state.productId
            });
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: "Loading",
                action: null,
                nonBlocking: false
            });
        }
    }

    function duplicateSkill(skillConfigId, onSuccessCallback, isDomainDifferent, domainId) {

        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: isDomainDifferent ? api.state.overrideSkillLoaderLabel : api.state.duplicatingSkillLoaderLabel,
            action: null,
            nonBlocking: false
        });
        helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
            method: 'POST',
            body: {
                operation: "DUPLICATE_SKILL",
                skillConfigId: skillConfigId,
                isDomainDifferent: !!isDomainDifferent,
                domainId: domainId
            }
        }).then(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: api.state.duplicatingSkillLoaderLabel,
                action: null,
                nonBlocking: false
            });
            onSuccessCallback(response);
        }).catch(error => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: api.state.duplicatingSkillLoaderLabel,
                action: null,
                nonBlocking: false
            });
            console.error(error);
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "value_update_error",
                    status: "critical",
                    icon: "info-circle-outline",
                    content: "Error ocurred while duplicating the skill.",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        });
    }

    async function updateSkillState(operation, skillConfigId, openSuccessModal, loaderLabel) {

        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: loaderLabel,
            action: null,
            nonBlocking: false
        });

        helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
            method: 'POST',
            body: {
                operation: operation,
                skillConfigId: skillConfigId,
                hasVarSet: false
            }
        }).then(async response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: loaderLabel,
                action: null,
                nonBlocking: false
            });

            if (openSuccessModal) {
                helpers.modal.open('skill_activation_modal');
            } else {
                helpers.modal.close('turn_off_skill_modal');
                api.data.get_skill_data_for_product_1.execute({
                    product_id: api.state.productId
                });
            }
        }).catch(error => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: loaderLabel,
                action: null,
                nonBlocking: false
            });
            let errorMessage = api.state.defaultErrorMessage;
            if (operation === "ACTIVATE_SKILL_CONFIG") {
                errorMessage = error?.error?.data?.result?.data + '' || api.state.activateContent;
            } else if (operation === "DEACTIVATE_SKILL_CONFIG") {
                helpers.modal.close('turn_off_skill_modal');
                errorMessage = error?.error?.data?.result?.data + '' || api.state.deactivateContent;
            }

            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "value_update_error",
                    status: "critical",
                    icon: "info-circle-outline",
                    content: errorMessage,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        });
    }


}
