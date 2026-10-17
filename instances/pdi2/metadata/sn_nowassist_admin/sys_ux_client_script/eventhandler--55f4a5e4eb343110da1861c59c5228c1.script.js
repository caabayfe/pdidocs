/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
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
    var blockcontext = { ...eventPayload.blockcontext
    };
    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    switch (eventName) {
        case "MODAL#EDITED_OOB_CONFIRM":
            aceUtils.refreshContentBlock('translate_modal_contents').then(() => {
                updateSkillState("ACTIVATE_SKILL_CONFIG", blockcontext.selectedSkillForActivation.id, true, blockcontext.activateLoaderLabel);
            });
            break;
        case "MODAL#EDITED_OOB_CANCEL":
            aceUtils.dismissModal('a1f7-6d3e-89bb9b-e3f0-a989cf9a');
            break;
        case "LG#ACTION_BUTTON_CLICKED":
            const domain = blockcontext.sessionDomain;
            if (domain !== eventPayload.item.domain) {
                blockcontext.duplicateSkillId = eventPayload.item.id;
                blockcontext.duplicateSkill = eventPayload.item;
                publish();
                aceUtils.openModal('49ad-57a7-bb889b-43c3-b8baaeb8');
            } else {
                if (!eventPayload.item.has_var_set) {
                    blockcontext.modalTitle = eventPayload.item.title.label;
                    // Keeping it static - Will get changed dynamically
                    blockcontext.modalSubtitle = eventPayload.item.success_message;
                    blockcontext.activateSkillModalHeading = eventPayload?.item?.activateModal?.heading;
                    blockcontext.activateSkillModalFooterButtons = eventPayload?.item?.activateModal?.buttons || [];
                    publish();
                    if (eventPayload.item.edited_in_nask) {
                        blockcontext.selectedSkillForActivation = eventPayload?.item;
                        publish();
                        aceUtils.openModal('a1f7-6d3e-89bb9b-e3f0-a989cf9a');
                    } else {
                        aceUtils.refreshContentBlock('translate_modal_contents').then(() => {
                            updateSkillState("ACTIVATE_SKILL_CONFIG", eventPayload.item.id, true, blockcontext.activateLoaderLabel);
                        });
                    }
                } else {
                    navigateToGuidedSetupPage(eventPayload.item.id);
                }
            }
            trackUsage("Activate skill clicked", {
                card: "Skill",
                skill: eventPayload?.item?.title?.label,
                feature: blockcontext.page_title,
                product: blockcontext.product,
                workflow: blockcontext.pageBreadcrumbs[1]?.label
            });
            break;
        case "MODAL#DOMAIN_WARNING_CONFIRM":
            aceUtils.dismissModal('49ad-57a7-bb889b-43c3-b8baaeb8');
            duplicateSkill(blockcontext.duplicateSkillId, onSuccessfullSkillDuplicateForActivate, true, blockcontext.sessionDomain);
            break;
        case "MODAL#DOMAIN_WARNING_CANCEL":
            aceUtils.dismissModal('49ad-57a7-bb889b-43c3-b8baaeb8');
            break;
        case "MODAL#ACTION_BUTTON_CLICKED":
            aceUtils.dismissModal('4215-01de-9bb8b8-803a-98a86cab');
            break;
        case "MODAL#NAVIGATE_TO_URL":
            api.emit("NAV_ITEM_SELECTED", {
                external: {
                    url: eventPayload?.item?.url,
                    target: "_blank"
                }
            });

            break;
        case "LIST#CELL_LINK_CLICKED":
            if (eventPayload.cell.domain !== blockcontext.sessionDomain) {
                blockcontext.duplicateSkillId = eventPayload.cell.id;
                blockcontext.duplicateSkillName = eventPayload.cell.value;
                publish();
                aceUtils.openModal("8264-da10-89bb8a-92f4-8a9af68a");
            } else if (eventPayload.cell.has_var_set.toString() == "true") {
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

                if (eventPayload.context.rows[0].cells.name.domain !== blockcontext.sessionDomain) {
                    aceUtils.openModal('5e4e-eb16-8ba9a9-d6d4-9aab5d88');
                } else {
                    aceUtils.refreshContentBlock('translate_modal_message').then(() => {
                        aceUtils.openModal('c070-ae5e-b8b998-81b0-aa991f9a');
                    });
                }

            } else if (eventPayload.actionItem.id == "edit") {
                if (eventPayload.context.rows[0].cells.name.domain !== blockcontext.sessionDomain) {
                    blockcontext.duplicateSkillId = skillId;
                    blockcontext.duplicateSkillName = skillName;
                    publish();
                    aceUtils.openModal("8264-da10-89bb8a-92f4-8a9af68a");
                } else {
                    navigateToGuidedSetupPage(skillId);
                }
            } else if (eventPayload.actionItem.id == "duplicate") {
                blockcontext.duplicateSkillId = skillId;
                blockcontext.duplicateSkillName = skillName;
                publish();
                if (eventPayload.context.rows[0].cells.name.domain !== blockcontext.sessionDomain) {
                    aceUtils.openModal("f14a-8bf5-99b9b8-35e0-988911bb");
                } else {
                    aceUtils.openModal('e78b-b465-ab8a88-9975-a898668a');
                }
            } else if (eventPayload.actionItem.id == "troubleshoot") {
                blockcontext.troubleshootSkillId = skillId;
                blockcontext.troubleshootSkillName = skillName;
                blockcontext.showTroubleshootLoading = true;
                blockcontext.showTroubleshootResult = false;
                blockcontext.showEmptyResult = false;
                blockcontext.troubleshootErrorOccured = false;
                publish();
                aceUtils.openModal("562a-b66d-9ab9aa-b687-a9ba36bb");
                aceUtils.refreshContentBlock('troubleshoot_block');
            } else if (eventPayload.actionItem.id == "monitor_errors") {
                blockcontext.monitorResults = blockcontext.monitorResultsObj[skillId] || [];
                publish();
                aceUtils.openModal("31f3-9024-bb8abb-750d-aab88fa8");

            }
            break;
        case "MODAL#DEACTIVATE_DIFFERENT_DOMAIN_SKILL":
            duplicateSkill(blockcontext.selectedSkillConfigIdForDeactivation, onSuccessfulDeactivateSkillDuplicate, true, blockcontext.sessionDomain);
        case "MODAL#DEACTIVATE_DIFFERENT_DOMAIN_SKILL_CANCELLED":
            aceUtils.dismissModal("5e4e-eb16-8ba9a9-d6d4-9aab5d88");
            break;
        case "MODAL#TURN_OFF_CLICKED":
            updateSkillState("DEACTIVATE_SKILL_CONFIG", blockcontext.selectedSkillConfigIdForDeactivation, false, blockcontext.deactivateLoaderLabel);
            break;
        case "MODAL#DEACTIVATE_CANCEL_CLICKED":
            aceUtils.dismissModal('c070-ae5e-b8b998-81b0-aa991f9a');
            break;
        case "DUPLICATE_SKILL_CONFIRMED":
            duplicateSkill(blockcontext.duplicateSkillId, onSuccessfulSkillDuplicate);
        case "DUPLICATE_SKILL_MODAL_CLOSED":
            aceUtils.dismissModal('e78b-b465-ab8a88-9975-a898668a');
            break;
        case "MORE_ACTIONS#ITEM_CLICKED":
            if (eventPayload.item.id == 'duplicate') {
                blockcontext.duplicateSkillId = eventPayload.item.skillId;
                blockcontext.duplicateSkillName = eventPayload.item.skillName;
                publish();
                if (eventPayload.item.domain !== blockcontext.sessionDomain) {
                    aceUtils.openModal("f14a-8bf5-99b9b8-35e0-988911bb");
                } else {
                    aceUtils.openModal('e78b-b465-ab8a88-9975-a898668a');
                }
            } else if (eventPayload.item.id == 'troubleshoot') {
                blockcontext.troubleshootSkillId = eventPayload.item.skillId;
                blockcontext.troubleshootSkillName = eventPayload.item.skillName;
                blockcontext.showTroubleshootLoading = true;
                blockcontext.showTroubleshootResult = false;
                blockcontext.showEmptyResult = false;
                blockcontext.troubleshootErrorOccured = false;
                publish();
                aceUtils.openModal("562a-b66d-9ab9aa-b687-a9ba36bb");
                aceUtils.refreshContentBlock('troubleshoot_block');
            } else if (eventPayload.item.id == 'monitor_errors') {
                blockcontext.monitorResults = blockcontext.monitorResultsObj[eventPayload.item.skillId] || [];
                publish();
                aceUtils.openModal("31f3-9024-bb8abb-750d-aab88fa8");

            }
            break;
        case "MODAL#COPY_DIFFERENT_DOMAIN_SKILL":
            duplicateSkill(blockcontext.duplicateSkillId, onSuccessfulSkillDuplicate, true, blockcontext.sessionDomain);
        case "MODAL#COPY_DIFFERENT_DOMAIN_SKILL_CANCELLED":
            aceUtils.dismissModal("f14a-8bf5-99b9b8-35e0-988911bb");
            break;
        case "MODAL#EDIT_DIFFERENT_DOMAIN_SKILL":
            duplicateSkill(blockcontext.duplicateSkillId, onSuccessfulEditSkillDuplicate, true, blockcontext.sessionDomain);
        case "MODAL#EDIT_DIFFERENT_DOMAIN_SKILL_CANCELLED":
            aceUtils.dismissModal("8264-da10-89bb8a-92f4-8a9af68a");
            break;
        case "DONE#CLICKED":
            aceUtils.dismissModal("562a-b66d-9ab9aa-b687-a9ba36bb");
            break;
        case "LG_FOOTER_BUTTON_BARE#CLICKED":
            blockcontext.consentSkillId = eventPayload?.item?.id;
            blockcontext.consentSkillName = eventPayload?.item?.title?.label;
            blockcontext.enableSkillButtonDisabled = true;
            blockcontext.agreeConsentSelected = 'agreeConsent';
            blockcontext.switchNowLlmSelected = '';
            publish();
            aceUtils.refreshContentBlock('switch_now_llm_check').then(() => {
                aceUtils.openModal("903e-ad93-abbbb8-9249-888b08b8")
            });
            break;
        case "AGREE_CONSENT_RADIO#SELECTED":
            blockcontext.agreeConsentSelected = 'agreeConsent';
            if (blockcontext.showSwitchtoNowLLMButton) {
                blockcontext.switchNowLlmSelected = '';
            }
            publish();
            break;
        case "SWITCH_NOW_LLM_RADIO#SELECTED":
            blockcontext.switchNowLlmSelected = 'switchToNowLLM';
            blockcontext.agreeConsentSelected = '';
            publish();
            break;
        case "CONSENT_NEXT#CLICKED":
            aceUtils.openModal("754c-1f0b-9bb8aa-2299-98b986aa")
            break;
        case "AGREE_CHECKBOX#CLICKED":
            blockcontext.enableSkillButtonDisabled = !eventPayload?.value;
            publish();
            break;
        case "ENABLE_SKILL_BUTTON#CLICKED":
            aceUtils.dismissModal("903e-ad93-abbbb8-9249-888b08b8");
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: true,
                label: "Loading",
                action: null,
                nonBlocking: false
            });
            var dataBlock;
            if (blockcontext.agreeConsentSelected) {
                dataBlock = 'set_llm_consent';
            } else if (blockcontext.showSwitchtoNowLLMButton && blockcontext.switchNowLlmSelected) {
                dataBlock = 'switch_to_now_llm';
            }
            if (dataBlock) {
                aceUtils.refreshContentBlock(dataBlock).then(() => {
                    aceUtils.refreshContentBlock('skill_details').then(() => {
                        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                            loading: false,
                            label: "Loading",
                            action: null,
                            nonBlocking: false
                        });
                        if (blockcontext.switchNowLlmSelected === 'switchToNowLLM') {
                            aceUtils.getContext().then((context) => {
                                blockcontext = context;
                                if (blockcontext.switchNowLLMStatus === "Success") {
                                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                                        items: [{
                                            id: "switch_lm_alert",
                                            status: "info",
                                            icon: "info-circle-outline",
                                            content: blockcontext.switchToNowLlmSuccessAlertMessage,
                                            action: {
                                                type: "dismiss"
                                            }
                                        }]
                                    });

                                } else {
                                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                                        items: [{
                                            id: "switch_now_llm_error",
                                            status: "critical",
                                            icon: "info-circle-outline",
                                            content: "Some error occurred while switching the provider to Now LLM.",
                                            action: {
                                                type: "dismiss"
                                            }
                                        }]
                                    });
                                }
                            });
                        }
                    })

                })
            }

            break;
        case "CONSENT_MODAL_CANCEL#CLICKED":
            aceUtils.dismissModal("903e-ad93-abbbb8-9249-888b08b8");
            break;
        case "CONSENT_BACK#CLICKED":
            aceUtils.dismissModal("754c-1f0b-9bb8aa-2299-98b986aa");
            aceUtils.openModal("903e-ad93-abbbb8-9249-888b08b8");
            break;
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

    function publish() {
        aceUtils.setContext(blockcontext);
    }

    function onSuccessfulDeactivateSkillDuplicate(response) {
        updateSkillState("DEACTIVATE_SKILL_CONFIG", response.response.result.newSkillConfigId, false, blockcontext.deactivateLoaderLabel);
    }

    function onSuccessfulEditSkillDuplicate(response) {
        navigateToGuidedSetupPage(response.response.result.newSkillConfigId);
    }

    function onSuccessfullSkillDuplicateForActivate(response) {
        if (response.response.result.hasVarSet) {
            navigateToGuidedSetupPage(response.response.result.newSkillConfigId);
        } else {
            blockcontext.modalTitle = blockcontext.duplicateSkill.title.label;
            // Keeping it static - Will get changed dynamically
            blockcontext.modalSubtitle = blockcontext.duplicateSkill.success_message;
            publish();
            aceUtils.refreshContentBlock('translate_modal_contents').then(() => {
                updateSkillState("ACTIVATE_SKILL_CONFIG", response.response.result.newSkillConfigId, true, blockcontext.activateLoaderLabel);
            });
        }
    }

    function onSuccessfulSkillDuplicate(response) {
        if (response.response.result.hasVarSet) {
            navigateToGuidedSetupPage(response.response.result.newSkillConfigId);
        } else {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: true,
                label: "Loading",
                action: null,
                nonBlocking: false
            });
            aceUtils.refreshContentBlock('skill_details').then(() => {
                api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                    loading: false,
                    label: "Loading",
                    action: null,
                    nonBlocking: false
                });
            })
        }
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

    function updateSkillState(operation, skillConfigId, openSuccessModal, loaderLabel) {
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
            aceUtils.refreshContentBlock('skill_details');
            if (openSuccessModal) {
                aceUtils.openModal('4215-01de-9bb8b8-803a-98a86cab');
            } else {
                aceUtils.dismissModal('c070-ae5e-b8b998-81b0-aa991f9a');
            }
        }).catch(error => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: loaderLabel,
                action: null,
                nonBlocking: false
            });
            let errorMessage = blockcontext.defaultErrorMessage;
            if (operation === "ACTIVATE_SKILL_CONFIG") {
                errorMessage = error?.error?.data?.result?.data + '' || blockcontext.activateContent;
            } else if (operation === "DEACTIVATE_SKILL_CONFIG") {
                aceUtils.dismissModal('c070-ae5e-b8b998-81b0-aa991f9a');
                errorMessage = error?.error?.data?.result?.data + '' || blockcontext.deactivateContent;
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
