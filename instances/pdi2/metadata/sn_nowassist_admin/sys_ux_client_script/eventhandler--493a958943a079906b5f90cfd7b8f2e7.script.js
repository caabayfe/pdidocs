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
    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    const currentStep = api.state.selectedStep;
    if (event.name === "ACE_ACTION_PERFORMED") {
        // Events emitted from ACE Page
        let {
            eventName,
            eventPayload
        } = event.payload;

        eventPayload = eventPayload || {};
        let skillConfigData = { ...api.state.skillConfigData
        };
        switch (eventName) {
            case "SN_NS_ADMIN_INPUT_VALUE_CHANGED":
                const {
                    variableName,
                    variableValue,
                    sysId
                } = eventPayload;

                switch (variableName) {
                    case "in_product_delivery":
                        skillConfigData.in_product_active = variableValue;
                        break;
                    case "ns_panel_delivery":
                        skillConfigData.nap_active = variableValue;
                        break;
                    case "ce_roles":
                        skillConfigData.ce_roles = variableValue;
                        break;
                    case "in_product_roles":
                        skillConfigData.in_product_roles = variableValue;
                        break;
                    case "in_mobile_active":
                        skillConfigData.in_mobile_active = variableValue;
                        break;
                    case "in_mobile_roles":
                        skillConfigData.in_mobile_roles = variableValue;
                        break;
                    case "nacm_delivery":
                        api.setState('nacmActive', variableValue.toString());
                        break;
                    case "ns_selected_ce_delivery":
                        skillConfigData.selected_ce = variableValue;
                        const checkActiveStatus = id => variableValue?.some(item => item?.id === id);
                        skillConfigData.va_active = checkActiveStatus("va");
                        skillConfigData.nap_active = checkActiveStatus("nap");
                        skillConfigData.selected_va_list = eventPayload.selectedVAList || [];
                        break;
                    case "selected_va_list":
                        skillConfigData.selected_va_list = variableValue;
                        break;
                    case "ui_action_active":
                        skillConfigData.ui_action_active = variableValue;
                        break;
                    case "ui_action_roles":
                        skillConfigData.ui_action_roles = variableValue;
                        break;
                    case "aclData":
                        skillConfigData.aclData = variableValue.aclData;
                        if (variableValue.aclScopeData) {
                            api.setState("disableSyncRoles", variableValue.aclScopeData.is_scope_not_matched);
                            api.setState("syncRolesCrosssScopeErrorMessage", variableValue.aclScopeData.crossScopeErrorMsg);
                        }
                        if (skillConfigData.allowEditingRMRoles && (skillConfigData.roleMaskingData.allowAllSessionRoles === true ? false : !skillConfigData.roleMaskingData?.roles?.length))
                            disableNextButton();
                        break;
                    case "save_roleMaskingData":
                        skillConfigData.roleMaskingData = variableValue;
                        var contentTree = [...api.state.contentTree];
                        contentTree[0].guided_context.roleMaskingData = variableValue;
                        api.setState("contentTree", contentTree);
                        break;
                    case "nap_status":
                        skillConfigData.nap_status = {
                            nowAssistPanelEnabled: variableValue
                        };
                        break;
                    case "enable_workflow_trigger":
                        skillConfigData.enable_workflow_trigger = variableValue;
                        // Break is removed intentionally to update the enable trigger Var set props
                    default:
                        // Update override variables
                        if (!!sysId && sysId !== skillConfigData.variable_sets[api.state.selectedStep.index].sys_id) {
                            const overrideSet = skillConfigData.variable_sets[api.state.selectedStep.index].override_sets;
                            if (overrideSet) {
                                for (const override of overrideSet) {
                                    if (override.sys_id === sysId) {
                                        override.props[variableName] = variableValue;
                                        break;
                                    }
                                }
                            }
                        } else {
                            skillConfigData.variable_sets[api.state.selectedStep.index].props[variableName] = variableValue;
                        }
                        break;
                }


                api.setState("skillConfigData", skillConfigData);
                api.setState("isVariableChanged", { ...api.state.isVariableChanged,
                    [currentStep.index]: true
                });
                break;
            case "SN_NS_ADMIN_SET_REVIEW_DATA":
                skillConfigData.custom_review_content[skillConfigData.variable_sets[currentStep.index].sys_id] = {
                    title: eventPayload.title || "",
                    description: eventPayload.description || ""
                };
                api.setState("skillConfigData", skillConfigData);
                break;
            case "SN_NS_ADMIN_REMOVE_REVIEW_DATA":
                if (!!skillConfigData.custom_review_content[skillConfigData.variable_sets[currentStep.index].sys_id]) {
                    delete skillConfigData.custom_review_content[skillConfigData.variable_sets[currentStep.index].sys_id];
                    api.setState("skillConfigData", skillConfigData);
                }
                break;
            case "SN_NS_ADD_NOTIFICATION":
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: eventPayload.items
                });
                break;
            case "SN_NS_REMOVE_NOTIFICATION":
                api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                    items: eventPayload.items
                });
                break;
            case "SN_NS_SHOW_ERROR_SCREEN":
                showErrorScreen();
                break;
            case "SN_NS_ADMIN_OVERRIDE_SAVE":
                api.setState("overrideSaveFunctions", { ...api.state.overrideSaveFunctions,
                    [skillConfigData.variable_sets[currentStep.index].sys_id]: {
                        overrideFunction: eventPayload.overrideFunction,
                        payload: eventPayload.payload
                    }
                });
                break;
            case "SN_NS_ADMIN_REMOVE_OVERRIDE_SAVE":
                let overrideSaveFunctions = { ...api.state.overrideSaveFunctions
                };
                if (!!overrideSaveFunctions[skillConfigData.variable_sets[currentStep.index].sys_id]) {
                    delete overrideSaveFunctions[skillConfigData.variable_sets[currentStep.index].sys_id];
                    api.setState("overrideSaveFunctions", overrideSaveFunctions);
                }
                break;
            case "SN_NS_ADMIN_SAVE_VAR_SET_DATA":
                saveInputData(eventPayload.varSetId, eventPayload.moveToNextStep, eventPayload.payload, eventPayload.forceSave, eventPayload.successMessage, eventPayload.errorMessage);
                break;
            case "SN_NS_ADMIN_GO_TO_NEXT_STEP":
                moveToNextStep();
                break;
            case "SN_NS_ADMIN_GO_TO_PREVIOUS_STEP":
                moveToPreviousStep();
                break;
            case "SN_NS_ADMIN_DISABLE_NEXT":
                disableNextButton();
                break;
            case "SN_NS_ADMIN_ENABLE_NEXT":
                enableNextButton();
                break;
            case "SN_NS_ADMIN_ACTIVATE_SKILL":
                activateSkill();
                break;
            case "SN_NS_ADMIN_UPDATE_SKILL_GENERAL_DETAILS":
                skillConfigData.name = eventPayload.name;
                skillConfigData.skill_description = eventPayload.description;
                skillConfigData.order = eventPayload.order || skillConfigData.order;
                if (eventPayload && eventPayload.skillTranslatedText) {
                    skillConfigData.translated_text = eventPayload.skillTranslatedText;
                    skillConfigData.variable_sets.map((value, index) => {
                        if (value.sys_id == 'select-delivery') {
                            skillConfigData.variable_sets[index].description = eventPayload?.skillTranslatedText?.delivery_step_description;
                        }
                    });
                }

                api.setState("skillConfigData", skillConfigData);
                break;
            case "SN_NS_ADMIN_REFRESH_GUIDED_STEP_DATA":
                api.setState('wasDataManuallyRefreshed', true);
                api.data.now_assist_admin_fetch_skill_config.refresh();
                break;

        }
    } else {
        switch (event.elementId) {
            case "step_back":
                moveToPreviousStep();
                break;
            case "sync_roles_1":
                var skillConfigData = api.state.skillConfigData;
                skillConfigData.aclData = event.payload.data.output;
                api.setState('skillConfigData', skillConfigData);
                if (skillConfigData.variable_sets[api.state.selectedStep.index].sys_id === "define-access")
                    moveToNextStep();
                else
                    updateDeliveryMode(moveToNextStep);

                break;
            case "step_next":
                saveInputData();
                break;
            case "activate":
                activateSkill();
                break;
            case "content_tree":
                switch (event.name) {
                    case "NOW_CONTENT_TREE#ITEM_CLICKED":
                        let skillConfigData = api.state.skillConfigData;
                        // Getting index of the first child when a parent step is clicked
                        const getStepIndex = item => item?.index ?? getStepIndex(item?.children[0]);
                        var index = getStepIndex(event?.payload?.item);
                        if (skillConfigData?.active || skillConfigData?.variable_sets[index]?.step_completed) {
                            changeStep(index);
                        }
                        break;
                }
                break;
            case "gemini_websearch_alert":
                api.setState("showGeminiWebSearchBanner", false);
                break;
        }
    }

    function activateSkill() {
        let activatingSkillLabel = api.state.skillConfigData.translated_text.activatingSkillLabel;
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: activatingSkillLabel,
            action: null,
            nonBlocking: false
        });

        helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
            method: 'POST',
            body: {
                operation: "ACTIVATE_SKILL_CONFIG",
                skillConfigId: api.state.skillConfigData.sys_id,
                hasVarSet: true
            }
        }).then(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: activatingSkillLabel,
                action: null,
                nonBlocking: false
            });

            const skillConfigData = { ...api.state.skillConfigData
            };
            skillConfigData.variable_sets[currentStep.index].step_completed = true;
            toggleContentTreeIcons(currentStep.index, skillConfigData);
            skillConfigData.active = true;
            skillConfigData.skill_parent = response?.response?.result?.parent;
            api.setState("skillConfigData", skillConfigData);
            if (api.state.nacmActive === "true") {
                api.emit('MODAL_SELECTED', {
                    modalId: "[component-id$='activate_modal_nacm']",
                    showModal: true
                });
            } else {
                api.emit('MODAL_SELECTED', {
                    modalId: "[component-id$='activate_modal']",
                    showModal: true
                });
            }
        }).catch(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: activatingSkillLabel,
                action: null,
                nonBlocking: false
            });

            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "value_update_error",
                    status: "critical",
                    icon: "info-circle-outline",
                    content: response?.error?.data?.result?.data || api.state.skillConfigData.translated_text.activateError,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            console.error(response.error);
        });
        trackUsage("Activate button in guided setup", {
            skill: api.state?.skillConfigData?.name,
            feature: api.state?.skillConfigData?.skill_family_name,
            product: api.state?.skillConfigData?.skill_family_parent_name,
            workflow: api.state?.skillConfigData?.skill_workflow_name
        });
    }

    function getOverrideFunctionPayload(varSetData) {
        return {
            variables: varSetData.props,
            childVarSets: varSetData.override_sets.map(override_set => getOverrideFunctionPayload(override_set))
        };
    }

    function getVarSetIndexById(varSets, varSetId) {
        return varSets.findIndex((varSet) => varSet.sys_id === varSetId);
    }

    function getVarSetById(varSets, varSetId) {
        let varSetIndex = getVarSetIndexById(varSets, varSetId);

        if (varSetIndex !== -1) {
            return { ...varSets[varSetIndex]
            };
        };

        for (const varSet of varSets) {
            if (varSet.override_sets && varSet.override_sets.length > 0) {
                let varSetData = getVarSetById(varSet.override_sets, varSetId);
                if (!!varSetData) {
                    return varSetData;
                }
            }
        }

        return null;
    }

    function getVarSetIndexesById(varSets, varSetId) {
        let index = varSets.findIndex((varSet) => varSet.sys_id === varSetId);
        if (index != -1) {
            return [index];
        }

        let varSetIndex = 0;
        for (const varSet of varSets) {
            if (varSet.override_sets && varSet.override_sets.length > 0) {
                let varSetDataPath = getVarSetIndexesById(varSet.override_sets, varSetId);
                if (varSetDataPath.length > 0) {
                    return [varSetIndex].concat(varSetDataPath);
                }
            }
            varSetIndex++;
        }
        return [];
    }

    function mergeVarSetData(varSetData, payload) {
        let props = payload.props || {};
        let override_sets = payload.override_sets || [];

        varSetData["props"] = {
            ...varSetData["props"],
            ...props
        };

        for (let overrideSetIndex = 0; overrideSetIndex < override_sets.length; overrideSetIndex++) {
            if (!varSetData.override_sets || overrideSetIndex >= varSetData.override_sets.length) break;
            let overrideSetPayload = override_sets[overrideSetIndex];
            varSetData["override_sets"][overrideSetIndex] = mergeVarSetData(varSetData["override_sets"][overrideSetIndex], overrideSetPayload);
        }
        return varSetData;
    }

    function saveInputData(varSetId = "", moveToNextStepToggle = true, payload = null, forceSave = false, successMessage = "", errorMessage = "") {
        let skillConfigVarSet = {};

        if (!!varSetId) {
            let skillConfigVarSetData = getVarSetById(api.state.skillConfigData.variable_sets, varSetId);
            if (!skillConfigVarSetData) {
                console.error("Invalid var set sys id.");
                return;
            }
            skillConfigVarSet = { ...skillConfigVarSetData
            };
        } else {
            skillConfigVarSet = { ...api.state.skillConfigData.variable_sets[currentStep.index]
            };
            varSetId = skillConfigVarSet.sys_id;
        }

        const isVariableChanged = api.state.isVariableChanged;
        const overrideSaveFunctionsData = api.state.overrideSaveFunctions;

        // If override save function is available, then override function is executed.
        if (!!overrideSaveFunctionsData[skillConfigVarSet.sys_id] && !forceSave) {
            const overrideFunctionData = overrideSaveFunctionsData[skillConfigVarSet.sys_id];
            if (!!payload) {
                overrideFunctionData.overrideFunction(getOverrideFunctionPayload(skillConfigVarSet), payload);
            } else if (!overrideFunctionData.payload) {
                overrideFunctionData.overrideFunction(getOverrideFunctionPayload(skillConfigVarSet));
            } else {
                overrideFunctionData.overrideFunction(getOverrideFunctionPayload(skillConfigVarSet), overrideFunctionData.payload);
            }
            return;
        }

        if (forceSave && !!payload) {
            let skillConfigData = { ...api.state.skillConfigData
            };
            let varSetIndexes = getVarSetIndexesById(skillConfigData.variable_sets, varSetId);
            if (varSetIndexes.length <= 0) {
                console.error("Invalid var set sys id.");
            }

            let varSetData = skillConfigData.variable_sets[varSetIndexes[0]];

            for (let varSetIndexesIndex = 1; varSetIndexesIndex < varSetIndexes.length; varSetIndexesIndex++) {
                varSetData = varSetData.override_sets[varSetIndexes[varSetIndexesIndex]];
            }

            mergeVarSetData(varSetData, payload);
            api.setState("skillConfigData", skillConfigData);
            skillConfigVarSet = varSetData;
        }

        if (skillConfigVarSet.sys_id == "select-delivery") {
            validateAclRoles(false);
            return;
        }
        if (skillConfigVarSet.sys_id == "define-access") {
            if (api.state.skillConfigData.allowEditingRMRoles)
                saveRoleMaskingData();
            validateAclRoles(true);
            return;
        }

        // If no change detected, then the props is set to empty object so it won't update the same value in the record.
        if (!isVariableChanged[currentStep.index] && !forceSave) {
            skillConfigVarSet["props"] = {};
            skillConfigVarSet["override_sets"] = [];
        }

        let savingInputLabel = api.state.skillConfigData.translated_text.savingInputLabel;
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: savingInputLabel,
            action: null,
            nonBlocking: false
        });

        helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
            method: 'POST',
            body: {
                operation: "UPDATE_SKILL_CONFIG_VAR_SET",
                skillConfigId: api.state.skillConfigData.sys_id,
                skillConfigVarSetId: skillConfigVarSet.sys_id,
                skillConfigVarSetData: {
                    step_completed: true,
                    props: skillConfigVarSet.props,
                    override_sets: skillConfigVarSet.override_sets
                }
            }
        }).then(response => {
            api.emit('SCREEN_STATUS_CHANGED', {
                isDirty: false
            });
            if (moveToNextStepToggle) {
                moveToNextStep(false);
            }
            isVariableChanged[currentStep.index] = false;
            api.setState("isVariableChanged", isVariableChanged);
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });
            if (!!successMessage) {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'alert5',
                        status: 'positive',
                        icon: 'check-circle-outline',
                        content: successMessage,
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
            }
        }).catch(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });

            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "value_update_error",
                    status: "critical",
                    icon: "info-circle-outline",
                    content: errorMessage ? errorMessage : api.state.skillConfigData.translated_text.commonError,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            console.error(response.error);
        });
    }

    function saveRoleMaskingData() {
        var skillConfigData = api.state.skillConfigData;
        var roleMaskingData = skillConfigData.roleMaskingData;
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: savingInputLabel,
            action: null,
            nonBlocking: false
        });

        helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
            method: 'POST',
            body: {
                operation: "SAVE_RM_ROLES",
                roleMaskingData: roleMaskingData,
                skillConfigId: skillConfigData.sys_id,
                skillName: skillConfigData.name
            }
        }).then(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });
            skillConfigData.roleMaskingData.response = [response.response.result];
            api.setState('skillConfigData', skillConfigData);
        }).catch(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });

            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "value_update_error",
                    status: "critical",
                    icon: "info-circle-outline",
                    content: skillConfigData.translated_text.saveInputError,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        });

    }

    function updateDeliveryMode(moveToNextStepToggle = true) {
        const isVariableChanged = api.state.isVariableChanged;

        let skillConfig = api.state.skillConfigData;
        if (nacmActive !== "") {
            api?.data?.save_nacm_details_1?.execute({
                skillConfigId: api?.state?.skillConfigData?.sys_id,
                state: api?.state?.nacmActive
            });
        }

        let savingInputLabel = skillConfig.translated_text.savingInputLabel;
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            label: savingInputLabel,
            action: null,
            nonBlocking: false
        });

        var chatExperiences = skillConfig?.va_active ? skillConfig?.selected_va_list : [];
        if (skillConfig?.nap_active) {
            chatExperiences.push(api?.state?.napChatExperience)
        }

        helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
            method: 'POST',
            body: {
                operation: "UPDATE_DELIVERY_MODE",
                skillConfigId: skillConfig.sys_id,
                genAiSkillApplicabilityId: skillConfig.nap_skill_applicability,
                inProductActive: skillConfig.in_product_active,
                inProductRoles: skillConfig.in_product_roles,
                inMobileActive: skillConfig.in_mobile_active,
                inMobileRoles: skillConfig.in_mobile_roles,
                ceActive: (skillConfig.isGeneratedFromSkillKit && !skillConfig.edited_in_nask) ? (skillConfig?.va_active || skillConfig.nap_active) : skillConfig.nap_active,
                ceRoles: skillConfig.ce_roles,
                updateRoles: skillConfig.nap_skill_applicability && !skillConfig.nap_skill_applicability.includes(","), // Update roles only if one sys_gen_ai_skill_applicability record mapped
                chatExperiences: chatExperiences,
                stepCompleted: true,
                isGeneratedFromSkillKit: skillConfig.isGeneratedFromSkillKit,
                editedInNask: skillConfig.edited_in_nask,
            }
        }).then(response => {
            if (moveToNextStepToggle) {
                moveToNextStep(false);
            }
            isVariableChanged[currentStep.index] = false;
            api.setState("isVariableChanged", isVariableChanged);
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });
        }).catch(response => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });

            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "value_update_error",
                    status: "critical",
                    icon: "info-circle-outline",
                    content: api.state.skillConfigData.translated_text.saveInputError,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            console.error(response.error);
        });

    }

    function markStepAsCompleted(stepIndex, updateGuidedSetupStatus) {
        let skillConfigData = api.state.skillConfigData;
        skillConfigData.variable_sets[stepIndex].step_completed = true;
        api.setState("skillConfigData", skillConfigData);

        if (updateGuidedSetupStatus) {
            let savingInputLabel = skillConfigData.translated_text.savingInputLabel;
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: true,
                label: savingInputLabel,
                action: null,
                nonBlocking: false
            });
            var stepId = skillConfigData.variable_sets[api.state.selectedStep.index].sys_id
            var skillConfigVarSetId = stepId === "define-access" || stepId === "select-display" ? stepId : skillConfigData.variable_sets[api.state.selectedStep.index].props.sys_id;
            helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
                method: 'POST',
                body: {
                    operation: "UPDATE_SKILL_CONFIG_VAR_SET_STEP_COMPLETED",
                    skillConfigId: skillConfigData.sys_id,
                    skillConfigVarSetId: skillConfigVarSetId,
                    stepCompleted: true
                }
            }).then(response => {
                changeStep(stepIndex + 1);

                api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                    loading: false,
                    label: savingInputLabel,
                    action: null,
                    nonBlocking: false
                });
            }).catch(response => {
                api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                    loading: false,
                    label: savingInputLabel,
                    action: null,
                    nonBlocking: false
                });

                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "value_update_error",
                        status: "critical",
                        icon: "info-circle-outline",
                        content: api.state.skillConfigData.translated_text.saveInputError,
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
                console.error(response.error);
            });
        } else {
            changeStep(stepIndex + 1);
        }
    }

    function showErrorScreen() {
        api.setState("errorInStep", true);
        disableNextButton();
    }

    function hideErrorScreen() {
        api.setState("errorInStep", false);
    }

    function disableNextButton() {
        api.setState("disableNextButton", true);
    }

    function enableNextButton() {
        api.setState("disableNextButton", false);
    }

    function moveToNextStep(updateGuidedSetupStatus = true) {
        if (currentStep.index < api?.state?.skillConfigData?.variable_sets?.length - 1) {
            markStepAsCompleted(currentStep.index, updateGuidedSetupStatus);
        }
    }

    function moveToPreviousStep() {
        if (currentStep.index > 0) {
            enableNextButton();
            changeStep(currentStep.index - 1);
        }
    }

    function findPath(steps, sysId) {
        for (let step of steps) {
            if (step?.id === sysId) {
                return [step?.id];
            }
            // If the current step has children, recursively search through them
            if (step?.children) {
                const path = findPath(step?.children, sysId);
                if (path) {
                    return [step?.id, ...path];
                }
            }
        }
        return null;
    }

    function changeStep(stepIndex) {
        var selectedStep = {
            index: stepIndex,
            itemId: []
        };
        // Saving data for selected step, pushing itemId details for parent and child steps if exists
        var stepData = api?.state?.skillConfigData?.variable_sets[stepIndex];
        selectedStep?.itemId?.push(findPath(api?.state?.steps, stepData?.sys_id));
        api.setState("selectedStep", selectedStep);

        if (api.state.disableNextButton) {
            enableNextButton();
        }

        if (api.state.errorInStep) {
            hideErrorScreen();
        }

        changeStepScreen(stepIndex);
    }

    function changeStepScreen(stepIndex) {
        let skillConfig = api.state.skillConfigData;
        let skillStep = skillConfig.variable_sets[stepIndex];

        toggleContentTreeIcons(stepIndex, skillConfig);

        if (!skillStep.screen_id) {
            api.setState("noScreenConfigured", true);
            disableNextButton();
            return;
        }

        api.setState("noScreenConfigured", false);

        const skill_config_var_sets = [];

        for (let skill_config_var_set_index = 0; skill_config_var_set_index < skillConfig.variable_sets.length - 1; skill_config_var_set_index++) {
            skill_config_var_sets.push({
                title: skillConfig.variable_sets[skill_config_var_set_index].title,
                description: skillConfig.variable_sets[skill_config_var_set_index].description,
                sysId: skillConfig.variable_sets[skill_config_var_set_index].sys_id,
                override_sets: skillConfig.variable_sets[skill_config_var_set_index].override_sets,
                props: skillConfig.variable_sets[skill_config_var_set_index].props,
                propsMetadata: skillConfig.variable_sets[skill_config_var_set_index].propsMetadata,
                config_type: skillConfig.variable_sets[skill_config_var_set_index].config_type,
            });
        }

        api.setState("contentTree", [{
            block_id: "1233445",
            guided_context: {
                title: skillStep.title,
                description: skillStep.description,
                skill_id: skillConfig.skill_id,
                skill_family: skillConfig.skill_family,
                skill_family_name: skillConfig.skill_family_name,
                skill_family_parent: skillConfig.skill_family_parent,
                skill_family_parent_name: skillConfig.skill_family_parent_name,
                skill_parent: skillConfig.skill_parent,
                skill_parent_name: skillConfig.skill_parent_name,
                is_variant: skillConfig.is_variant,
                skill_workflow: skillConfig.skill_workflow,
                skill_workflow_name: skillConfig.skill_workflow_name,
                skill_description: skillConfig.skill_description,
                skill_config_title: skillConfig.name,
                llmNames: skillConfig.llmNames,
                in_product_active: skillConfig.in_product_active,
                in_product_roles: skillConfig.in_product_roles,
                in_mobile_active: skillConfig.in_mobile_active,
                in_mobile_roles: skillConfig.in_mobile_roles,
                active: skillConfig.active,
                nap_status: skillConfig.nap_status,
                nap_active: skillConfig.nap_active,
                ce_roles: skillConfig.ce_roles,
                ce_roles_mandatory: skillConfig.ce_roles_mandatory,
                nap_skill_applicability: skillConfig.nap_skill_applicability,
                enable_workflow_trigger: skillConfig.enable_workflow_trigger,
                show_va_card: skillConfig.show_va_card,
                va_active: skillConfig.va_active,
                selected_ce: skillConfig.selected_ce,
                selected_va_list: skillConfig.selected_va_list,
                sysId: skillStep.sys_id,
                skill_config_id: skillConfig.sys_id,
                skill_config_var_sets: skill_config_var_sets,
                translated_text: skillConfig.translated_text,
                custom_review_content: skillConfig.custom_review_content,
                type: skillConfig.type,
                isGeneratedFromSkillKit: skillConfig.isGeneratedFromSkillKit,
                override_sets: skillStep.override_sets,
                ...skillStep.props,
                aclData: skillConfig.aclData,
                ui_action_roles: skillConfig.ui_action_roles,
                ui_action_id: skillConfig.ui_action_id,
                ui_action_active: skillConfig.ui_action_active,
                skill_config_order: skillConfig.order,
                roleMaskingData: skillConfig.roleMaskingData,
                allowEditingRMRoles: skillConfig.allowEditingRMRoles
            },
            props_details: {},
            type: {
                macroponent: skillStep.screen_id
            }
        }]);
    }

    function updateStepStatus(step, stepCompleted, isCurrentStep) {
        const status = stepCompleted ? {
                icon: "circle-check-fill",
                type: "icon"
            } :
            isCurrentStep ? {
                icon: "circle-semi-check-outline",
                type: "icon"
            } : {
                icon: "circle-dashed-outline",
                type: "icon"
            };
        if (step.statuses) {
            step.statuses = [status];
        }
        step.disabled = !(isCurrentStep || stepCompleted);
    }

    function updateStepStatusTree(steps, targetIndex, skillSteps) {

        for (let i = 0; i < steps.length; i++) {
            if (steps[i]?.children == null || steps[i]?.children?.length === 0) {
                // If step has no children, update the status of the step
                updateStepStatus(steps[i], skillSteps[steps[i]?.index]?.step_completed, steps[i]?.index === targetIndex);
            } else {
                // If the step has children, update the status of each step recursively
                steps[i].children = updateStepStatusTree(steps[i]?.children, targetIndex, skillSteps);
                steps[i].disabled = !steps[i]?.children.some(child => child?.disabled === false);
            }

        }
        return steps;
    }

    function toggleContentTreeIcons(stepIndex, skillConfig) {
        //For active skills, all steps is completed and no need of toggle the icons
        if (skillConfig.active) return;

        let updatedSteps = updateStepStatusTree(api?.state?.steps, stepIndex, skillConfig?.variable_sets);
        api.setState("steps", updatedSteps);
    }

    function validateAclRoles(moveToNextStepToggle) {
        if (!api.state.skillConfigData?.aclData_can_write) {
            moveToNextStepToggle ? moveToNextStep(true) : updateDeliveryMode(moveToNextStep);
            return;
        }
        if (api.state.skillConfigData?.aclScopeData) {
            api.setState("disableSyncRoles", api.state.skillConfigData.aclScopeData.is_scope_not_matched);
            api.setState("syncRolesCrosssScopeErrorMessage", api.state.skillConfigData.aclScopeData.crossScopeErrorMsg);
        }
        const skillConfigData = api.state.skillConfigData;
        const {
            ACLValidationUtil
        } = imports['sn_nowassist_admin.ACLValidationUtil']();

        var result = ACLValidationUtil.fetchMissingRoles(skillConfigData, skillConfigData.aclData || []);
        // Determine missing roles for each category

        api.setState('missingRoles', result?.missingRoles);

        if (result?.isValid) {
            moveToNextStepToggle
                ?
                moveToNextStep(true) :
                updateDeliveryMode(moveToNextStep);
        } else {
            helpers.modal.open('sync_roles_modal');
        }
    }
}
