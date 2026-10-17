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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    var blockcontext = { ...eventPayload.blockcontext
    };
    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    switch (eventName) {
        case "LIST#CELL_LINK_CLICKED":
            if (eventPayload.cell.has_var_set.toString() == "true") {
                navigateToGuidedSetupPage(eventPayload.cell.id);
            }
            break;
        case "LIST#ACTION_CLICKED":
            var skillName = "";
            var skillId = "";
            if (event.payload.eventPayload.context.rows) { //vancouver
                skillName = eventPayload.context.rows[0].cells.name.value;
                skillId = eventPayload.context.rows[0].key;
            } else { //utah
                skillName = eventPayload.context.row.cells.name.value;
                skillId = eventPayload.context.row.key;
            }
            if (eventPayload.actionItem.id == "deactivate") {
                blockcontext.turnOffModalMessage = skillName;
                blockcontext.selectedSkillConfigIdForDeactivation = skillId;
                publish();
                aceUtils.refreshContentBlock('translate_modal_message').then(() => {
                    aceUtils.openModal('338e-8b36-89aa98-cf36-a9abd58b');
                });
            } else if (eventPayload.actionItem.id == "edit") {
                navigateToGuidedSetupPage(skillId);
            } else if (eventPayload.actionItem.id == "edit_access") {
                blockcontext.skillId = skillId;
                blockcontext.isSkillActive = true;
                blockcontext.edit_access_skill_data = {
                    "allowEditingRMRoles": true,
                    "skillName": skillName
                };
                publish();
                aceUtils.refreshContentBlock('get_acl_data_for_skill_config').then(() => {
                    aceUtils.refreshContentBlock('get_role_masking_data_for_skill_config').then(() => {
                        aceUtils.openModal('9e83-2d6a-ab9ba9-caef-8999719a');
                    })
                })
            }
            break;
        case "MODAL#DEACTIVATE_CANCEL_CLICKED":
            aceUtils.dismissModal('338e-8b36-89aa98-cf36-a9abd58b');
            break;
        case "MODAL#TURN_OFF_CLICKED":
            aceUtils.dismissModal('338e-8b36-89aa98-cf36-a9abd58b');
            updateSkillState("DEACTIVATE_SKILL_CONFIG", blockcontext.selectedSkillConfigIdForDeactivation, blockcontext.deactivateLoaderLabel);
            break;
        case "LG#ACTION_BUTTON_CLICKED":
            aceUtils.refreshContentBlock("is_skill_using_websearch_and_gemini_1");
            if (!eventPayload.item.has_var_set) {
                blockcontext.successModalTitle = eventPayload.item.title.label;
                blockcontext.skillId = eventPayload.item.id;
                blockcontext.isSkillActive = false;
                var isDomainDifferent = blockcontext.sessionDomain != eventPayload.item.domain;
                blockcontext.edit_access_skill_data = {
                    "allowEditingRMRoles": true,
                    "skillName": eventPayload.item.title.label + (isDomainDifferent ? " for " + blockcontext.sessionDomainName : "")
                };
                publish();
                if(isDomainDifferent){
                    aceUtils.openModal("0e94-31e3-9898ab-5e90-8babe4bb");
                } else {
                    aceUtils.refreshContentBlock('get_acl_data_for_skill_config').then(() => {
                        aceUtils.refreshContentBlock('get_role_masking_data_for_skill_config').then(() => {
                            aceUtils.openModal('9e83-2d6a-ab9ba9-caef-8999719a');
                        });
                    });
                }
            } else {
                navigateToGuidedSetupPage(eventPayload.item.id);
            }
            trackUsage("Activate skill clicked", {
                card: "Skill",
                skill: eventPayload?.item?.title?.label,
                workflow: "Other"
            });
            break;
        case "ACTIVATION_MODAL#DONE_BUTTON_CLICKED":
            aceUtils.dismissModal("8f14-4ed6-a9b8b8-6cc2-b8aa4a88");
            break;
        case "TURN_ON_CANCEL#CLICKED":
            aceUtils.dismissModal('9e83-2d6a-ab9ba9-caef-8999719a');
            break;
        case "TURN_ON_BUTTON#CLICKED":
            aceUtils.dismissModal('9e83-2d6a-ab9ba9-caef-8999719a');
            if(blockcontext.edit_access_skill_data.allowEditingRMRoles) {
                aceUtils.refreshContentBlock('upsert_roles_for_role_masking').then(() => {
                    aceUtils.refreshContentBlock('get_role_masking_data_for_skill_config');
                });
            }
            updateSkillState("ACTIVATE_SKILL_CONFIG", blockcontext.skillId, blockcontext.activateLoaderLabel);
            break;
        case "EDIT_ACCESS_SAVE#CLICKED":
            aceUtils.dismissModal('9e83-2d6a-ab9ba9-caef-8999719a');
            if(blockcontext.edit_access_skill_data.allowEditingRMRoles) {
                aceUtils.refreshContentBlock('upsert_roles_for_role_masking').then(() => {
                    aceUtils.refreshContentBlock('get_role_masking_data_for_skill_config');
                });
            }
            break;
        case "TURN_ON_ADD_ACL#CLICKED":
            blockcontext.selectedRoles = [];
            blockcontext.selectRolesRadioSelected = false;
            blockcontext.selectedAclData={};
            publish();
            aceUtils.dismissModal('9e83-2d6a-ab9ba9-caef-8999719a');
            aceUtils.openModal('3d91-3694-b9a9a8-1ccd-8a893ab9');
            break;
        case "ADD_ACL_SAVE#CLICKED":

            blockcontext.selectedAclData = {
                roles: blockcontext.selectRolesRadioSelected ? blockcontext.selectedRoles.map(item => item.id) : [],
                decisionType: "allow",
                securityAttribute: blockcontext.selectRolesRadioSelected ? false : true,
                skill_config: blockcontext.skillId
            };
            publish();
           aceUtils.dismissModal('3d91-3694-b9a9a8-1ccd-8a893ab9');
            aceUtils.refreshContentBlock('create_allow_acl_for_skill_config').then(() => {
                aceUtils.refreshContentBlock('get_acl_data_for_skill_config').then(() => {
                    aceUtils.openModal('9e83-2d6a-ab9ba9-caef-8999719a');
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "create_acl_alert",
                            status: "positive",
                            icon: "circle-check-outline",
                            content: {
                                type: "html",
                                value: "Changes saved."
                            },
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                });
            });
            break;
        case "EDIT_ACL_CANCEL#CLICKED":
            aceUtils.dismissModal('3d91-3694-b9a9a8-1ccd-8a893ab9');
            publish();
            break;
        case "EDIT_ACL_APPLY#CLICKED":
            var selectedACLData = blockcontext.selectedAclData;
            selectedACLData.roles = blockcontext.selectRolesRadioSelected ? blockcontext.selectedRoles.map(item => item.id) : [];
            selectedACLData.securityAttribute = !blockcontext.selectRolesRadioSelected;
            selectedACLData.decisionType = "allow";
            blockcontext.selectedAclData = selectedACLData;
            publish();
            aceUtils.dismissModal('3d91-3694-b9a9a8-1ccd-8a893ab9');
            // Add ACL data
            aceUtils.refreshContentBlock('update_acl_roles_for_acl').then(() => {
                aceUtils.refreshContentBlock('get_acl_data_for_skill_config').then(() => {
                    aceUtils.openModal('9e83-2d6a-ab9ba9-caef-8999719a');
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "update_role_alert",
                            status: "positive",
                            icon: "circle-check-outline",
                            content: {
                                type: "html",
                                value: "Changes saved."
                            },
                            action: {
                                type: 'dismiss'
                            }
                        }]
                    });
                });
            });
            break;
        case "EDIT_ACL_ICON#CLICKED":
            var roles = eventPayload.cellContext.row.cells.roles.componentProps.pills.filter(item => item.pillValue !== 'any').map(({
                pillValue,
                pillText
            }) => ({
                id: pillValue,
                label: pillText
            }));
            blockcontext.selectedAclData = {
                id: eventPayload.cellContext.row.key,
                aclScopeData:eventPayload.cellContext.row?.aclScopeData,
                roles: roles.map(item => item.id),
                securityAttribute: false,
                decisionType: "allow",
                skill_config: blockcontext.skillId
            };
            blockcontext.selectRolesRadioSelected = eventPayload.cellContext.row.cells.roles.componentProps.pills.filter(item => item.pillValue === 'any').length === 0;
            blockcontext.selectedRoles = roles;
            publish();
            aceUtils.dismissModal('9e83-2d6a-ab9ba9-caef-8999719a');
            aceUtils.openModal('3d91-3694-b9a9a8-1ccd-8a893ab9');
            break;
        case "RADIO_BUTTONS#SET":
            blockcontext.selectRolesRadioSelected = eventPayload.value === 'select_roles';
            publish();
            break;
        case "SELECT_ROLES#SET":
            blockcontext.selectedRoles = eventPayload.value;
            publish();
            break;
        case "SELECT_MASKING_ROLES#SET":
            var rmRoles = eventPayload.value;
            let roleMaskingList = blockcontext.roleMaskingList;
            roleMaskingList.roles = rmRoles;
            blockcontext.roleMaskingList = roleMaskingList;
            blockcontext.disableTurnOn = roleMaskingList.allowAllSessionRoles ? false : !rmRoles?.length;
            publish();
            break;
        case "DOMAIN_MODAL_ACTIVATE#CLICKED":
            aceUtils.dismissModal("0e94-31e3-9898ab-5e90-8babe4bb");
            duplicateSkill(blockcontext.skillId, onSuccessfullSkillDuplicateForActivate, true, blockcontext.sessionDomain);
            break;
        case "DOMAIN_MODAL_CANCEL#CLICKED":
            aceUtils.dismissModal("0e94-31e3-9898ab-5e90-8babe4bb");
            break;
    }

    function duplicateSkill(skillConfigId, onSuccessCallback, isDomainDifferent, domainId) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: isDomainDifferent ? blockcontext.overrideSkillLoaderLabel : blockcontext.duplicatingSkillLoaderLabel,
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
                label: blockcontext.duplicatingSkillLoaderLabel,
                action: null,
                nonBlocking: false
            });
            onSuccessCallback(response);
        }).catch(error => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: blockcontext.duplicatingSkillLoaderLabel,
                action: null,
                nonBlocking: false
            });
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

    async function onSuccessfullSkillDuplicateForActivate(response) {
        blockcontext.skillId = response.response.result.newSkillConfigId;
        publish();
        aceUtils.refreshContentBlock('get_acl_data_for_skill_config').then(() => {
            aceUtils.refreshContentBlock('get_role_masking_data_for_skill_config').then(() => {
                aceUtils.openModal('9e83-2d6a-ab9ba9-caef-8999719a');
            });
        });
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

    function updateSkillState(operation, skillConfigId, loaderLabel) {
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
        }).then(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: loaderLabel,
                action: null,
                nonBlocking: false
            });

            if (operation === "ACTIVATE_SKILL_CONFIG") {
                aceUtils.refreshContentBlock('translate_available_modal_title').then(() => {
                    aceUtils.openModal("8f14-4ed6-a9b8b8-6cc2-b8aa4a88");
                    aceUtils.refreshContentBlock('get_active_skill_presentation_list_data').then(() => {
                        aceUtils.refreshContentBlock('fetch_available_other_skills');
                    });
                });
            } else {
                aceUtils.refreshContentBlock('get_active_skill_presentation_list_data').then(() => {
                    aceUtils.refreshContentBlock('fetch_available_other_skills');
                });
            }
        }).catch(error => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: loaderLabel,
                action: null,
                nonBlocking: false
            });
            let errorMessage = blockcontext.defaultErrorMessage;
            aceUtils.dismissModal('338e-8b36-89aa98-cf36-a9abd58b');
            errorMessage = error?.error?.data?.result?.data + '' || blockcontext.deactivateContent;

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

    function publish() {
        aceUtils.setContext(blockcontext);
    }

}
