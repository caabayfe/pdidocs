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

    let selectedButtonConfig = api.state.selectedButtonConfig;
    async function setModalContent(tabName) {
        let translatedMessage = await helpers.translate('Apply the same configurations as that of {0} to all unconfigured form fields.', [tabName]);
        api.setState('modalContent', translatedMessage);
    };

    function setErrorMessageForRefineCount(value, currentObj) {
        let message = '';
        let isInValid = false;
        if (value < 0 || value > api.state.MAX_VALUE_FOR_REFINE_COUNT) {
            message = api.state.errorMessageForRefineCount;
            isInValid = true;
        } else if (!Number.isInteger(Number(value))) {
            message = api.state.errorMessageForDecimalPlaces;
            isInValid = true;
        }
        currentObj.isInValid = isInValid;
        currentObj.content = message;
        return currentObj;
    }

    async function translateAndSaveErrorMessage(key, message) {
        if (key === 'defaultRefineCountAlert') {
            let defaultAlertConfig = api.state.defaultRefineCountAlert;
            defaultAlertConfig.content = message;
            api.setState('defaultRefineCountAlert', defaultAlertConfig);
        } else if (key === 'errorMessageForRefineCount') {
            api.setState('errorMessageForRefineCount', message);
        } else if (key === 'errorMessageForDecimalPlaces') {
            api.setState('errorMessageForDecimalPlaces', message);
        }
    }

    function addNotification(notificationType, message) {
        if (!message) {
            return;
        }
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: 'error-action-template',
                status: notificationType || 'warning',
                icon: 'circle-info-outline',
                content: {
                    type: "html",
                    value: message
                },
                action: {
                    type: "dismiss"
                },
            }]
        });
    }
    const actionQuery = {
        getActionQuery: (tableNames = [], actionType) => `action_typeIN${actionType},common${actionType === "preset" ? ",menuActionOnly": ""}^table_nameINsys_one_extend_capability,${tableNames.join(',')}`,
        getCTActionQuery: (tableNames = [], actionType) => `action_type=${actionType}^table_name=sys_one_extend_capability^NQaction_type=${actionType}^table_nameIN${tableNames.join(',')}`
    };

    function getNumberValue(value) {
        if (typeof value === 'number') {
            return value;
        } else if (typeof value === 'string') {
            return Number(value);
        } else {
            return 0;
        }
    }

    function getBooleanValue(value) {
        if (typeof value === 'boolean') {
            return value;
        } else if (value === 'true') {
            return true;
        } else {
            return false;
        }
    }


    function getTitle(name) {
        if (api.state.generalDetails?.props?.config_type === api.state.CONFIG_TYPE.TABLE) {
            name = name.split('.')[1];
        }
        return name;
    }

    function snakeToCamel(obj) {
        // Helper function to convert a single string from snake_case to camelCase
        const toCamelCase = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        if (Array.isArray(obj)) {
            // Recursively process arrays
            return obj.map(snakeToCamel);
        } else if (obj && typeof obj === 'object') {
            // Process objects recursively
            return Object.keys(obj).reduce((acc, key) => {
                const camelKey = toCamelCase(key); // Convert key to camelCase
                acc[camelKey] = snakeToCamel(obj[key]); // Recursively process value
                return acc;
            }, {});
        }

        // Return non-object values as-is
        return obj;
    }

    function formatActionList(actions = []) {
        return actions.map((obj) => {
            let newObj = {};
            Object.keys(obj).forEach((key) => {
                let newKey = key;
                let additionalText = '';
                if (key === '_row_data') {
                    return;
                } else if (key === 'sys_id') {
                    newKey = 'id';
                } else if (key === 'name') {
                    newKey = 'label';
                    if (!obj['active'].value) {
                        additionalText = '(Inactive)';
                    }
                    newObj['originalLabel'] = obj[key].value;
                }
                if (newKey !== key) {
                    newObj[key] = obj[key].value;
                }
                newObj[newKey] = obj[key].value;
                if (additionalText) {
                    newObj['sublabel'] = additionalText;
                }
            });

            return snakeToCamel(newObj);
        });
    }

    function setActionListForSelectedTab(selectedTabObj, actionKey, actionList = []) {
        let actionsString = selectedTabObj.props[actionKey] || '';
        let newActionsList = [];
        let hasInActiveActions = false;

        if (actionList.length) {
            if (actionsString.length) {
                let totalActionsRequired = actionsString.split(',').length;
                for (let i = 0; i < actionList.length; i++) {
                    let tempActionObj = JSON.parse(JSON.stringify(actionList[i]));
                    if (totalActionsRequired <= 0) {
                        break;
                    }
                    if (actionsString.includes(tempActionObj.id)) {
                        if (!tempActionObj.active) {
                            hasInActiveActions = true;
                            tempActionObj.label = `${tempActionObj.originalLabel} (Inactive)`;
                        }
                        newActionsList.push(tempActionObj);
                        totalActionsRequired -= 1;
                    }
                }
            }
            
            if(newActionsList.length){
                selectedTabObj.props[actionKey] = actionKey === 'default_preset_action' ? (newActionsList[0] || {id: ""}) : newActionsList;
            }

            if (actionKey === 'preset_actions') {
                selectedTabObj.props.hasInActivePresetActions = hasInActiveActions;
            } else if (actionKey === 'refine_actions') {
                selectedTabObj.props.hasInActiveRefineActions = hasInActiveActions;
            } else if (actionKey === 'call_to_action') {
                selectedTabObj.props.hasInActiveCTActions = hasInActiveActions;
            } else if (actionKey === 'default_preset_action') {
                selectedTabObj.props.hasInActiveDefaultPresetAction = hasInActiveActions;
            }
            updateNAcmConfig(selectedTabObj, [actionKey]);
        }
        return selectedTabObj;
    }

    function reformatAndSaveTabData(tabsData, selectedTabData) {
        selectedTabData = JSON.parse(JSON.stringify(selectedTabData));
        let currentIndex = selectedTabData.index;
        selectedTabData.props.isPresetActionInValid = validatePresetActions(selectedTabData);
        if (Array.isArray(selectedTabData.props.preset_actions)) {
            selectedTabData.props.preset_actions = selectedTabData.props.preset_actions.map((actionObj) => actionObj.id);
            selectedTabData.props.preset_actions = selectedTabData.props.preset_actions.join(',');
        }
        if (Array.isArray(selectedTabData.props.refine_actions)) {
            selectedTabData.props.refine_actions = selectedTabData.props.refine_actions.map((actionObj) => actionObj.id);
            selectedTabData.props.refine_actions = selectedTabData.props.refine_actions.join(',');
        }

        if (Array.isArray(selectedTabData.props.call_to_action)) {
            selectedTabData.props.call_to_action = selectedTabData.props.call_to_action.map((actionObj) => actionObj.id);
            selectedTabData.props.call_to_action = selectedTabData.props.call_to_action.join(',');
        }

        if (typeof selectedTabData.props.default_preset_action === 'object') {
            selectedTabData.props.default_preset_action = selectedTabData.props.default_preset_action.id;
        }

        if (typeof selectedTabData.props.button_props === 'object') {
            selectedTabData.props.button_props = JSON.stringify(selectedTabData.props.button_props);
        }

        if (typeof selectedTabData.props.recommendation_dialog_props === 'object') {
            if (!selectedTabData.props.recommendation_dialog_props.setRefineCount) {
                delete selectedTabData.props.recommendation_dialog_props.refineCount;
            }
            selectedTabData.props.recommendation_dialog_props = JSON.stringify(selectedTabData.props.recommendation_dialog_props);
        }
        selectedTabData.props.enable_extended_tables = getBooleanValue(selectedTabData.props.enable_extended_tables);
        // Uncomment this when we enable feedback feature
        // reFormatFeedback(selectedTabData, 'positive_feedback');
        // reFormatFeedback(selectedTabData, 'negative_feedback');

        let sysIdOfVarSet = selectedTabData['sys_id'] || selectedTabData['id'];
        tabsData[currentIndex] = selectedTabData;
        Object.keys(selectedTabData.props).forEach((variableKey) => {
            if (variableKey !== 'sys_id') {
                api.emit('ACE_ACTION_PERFORMED', {
                    eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
                    eventPayload: {
                        sysId: sysIdOfVarSet,
                        variableName: variableKey,
                        variableValue: selectedTabData.props[variableKey]
                    }
                });
            }
        });
        return selectedTabData;
    }


    function formatFeedback(selectedTabData, key) {
        if (typeof selectedTabData.props[key] === 'string') {
            selectedTabData.props[key] = JSON.parse(selectedTabData.props[key] || '{}');
            if (typeof selectedTabData.props[key].items === 'string') {
                selectedTabData.props[key].items = JSON.parse(selectedTabData.props[key].items);
            }
        } else if (!selectedTabData.props[key]) {
            selectedTabData.props[key] = {};
        }
        if (selectedTabData.props[key]?.items?.length) {
            selectedTabData.props[key].showFollowUpQuestions = getBooleanValue(selectedTabData.props[key].showFollowUpQuestions);
            let checkList = selectedTabData.props[key].items.find((itemData) => ["checklist", "radio"].includes(itemData.type));
            if (checkList?.value?.length) {
                selectedTabData.props[key + '_items'] = checkList?.value.map((checkListData) => {
                    if (!checkListData.hasOwnProperty('checked')) {
                        checkListData.checked = false;
                    }

                    return checkListData;
                });
            } else {
                selectedTabData.props[key + '_items'] = [];
            }
        } else {
            selectedTabData.props[key + '_items'] = [];
        }
        return selectedTabData;
    }

    function reFormatFeedback(selectedTabData, key) {
        let feedbackItems = selectedTabData.props[key + '_items'] || [];
        if (typeof selectedTabData.props[key] === 'string') {
            selectedTabData.props[key] = JSON.parse(selectedTabData.props[key] || '{}');
            if (typeof selectedTabData.props[key].items) {
                selectedTabData.props[key].items = JSON.parse(selectedTabData.props[key].items);
            }
        } else if (!selectedTabData.props[key]) {
            selectedTabData.props[key] = {};
        }
        if (selectedTabData.props[key]?.items?.length) {
            selectedTabData.props[key].items = selectedTabData.props[key].items.map((itemData) => {
                if (["checklist", "radio"].includes(itemData.type)) {
                    itemData.value = feedbackItems;
                }
                return itemData
            });
        }
        selectedTabData.props[key] = JSON.stringify(selectedTabData.props[key]);
        return selectedTabData;
    }

    function shouldShowModal(currentConfig = {}, tabs = [], onlyEvaluateCurrentConfig = false) {
        if (!api.state.modalConfirmationValue && api.state.generalDetails.props.config_type === api.state.CONFIG_TYPE.TABLE && api.state.isFirstTabReviewed) {
            if (onlyEvaluateCurrentConfig) {
                if (currentConfig.index > 0 && !getBooleanValue(currentConfig.props.is_config_tab_visited)) {
                    return true;
                }
            } else {
                return tabs.some((tabObj) => !getBooleanValue(tabObj.props.is_config_tab_visited) && tabObj.index > 0);
            }
        }

        return false;
    }

    function updateCurrentConfigObj(currentTabObj, firstTabObj) {
        const componentId = currentTabObj?.props?.wwna_component_id || currentTabObj?.title;
        currentTabObj.props = { ...currentTabObj.props,
            ...firstTabObj.props
        };
        currentTabObj.props.wwna_component_id = componentId;
        return currentTabObj;
    }

    function shouldAutoFill(currentObj, tabsData) {
        if (!getBooleanValue(currentObj.props.is_config_tab_visited) && currentObj.index > 0 && api.state.shouldAutoFill && api.state.generalDetails.props.config_type === api.state.CONFIG_TYPE.TABLE) {
            return true;
        }
        return false;
    }

    function setTabData(tabsData, eventPayload, hardReset = false) {
        let isTabListUpdated = false;
        let tabIndex = eventPayload.selectedTabIndex;
        let tabId = eventPayload.selectedTab || `id=component_list^index=${tabIndex}`;
        let currentSelectedTabIndex = api.state.selectedTabIndex;
        if (currentSelectedTabIndex === tabIndex && !hardReset) {
            return;
        }
        if (Number.isInteger(currentSelectedTabIndex) && !hardReset) {
            isTabListUpdated = true;
            reformatAndSaveTabData(tabsData, api.state.selectedButtonConfig);
        }
        let tempTabObj = JSON.parse(JSON.stringify(tabsData[tabIndex]));
        if (tabIndex > 0 && shouldShowModal(tempTabObj, tabsData, true)) {
            // api.setState('hasShownConfirmation', true);
            helpers.modal.open('confirmation_modal');
        }
        if (shouldAutoFill(tempTabObj)) {
            updateCurrentConfigObj(tempTabObj, tabsData[0]);
        }
        setActionListForSelectedTab(tempTabObj, 'preset_actions', api.state.presetActionList);
        setActionListForSelectedTab(tempTabObj, 'default_preset_action', api.state.presetActionList);
        setActionListForSelectedTab(tempTabObj, 'refine_actions', api.state.refineActionList);
        setActionListForSelectedTab(tempTabObj, 'call_to_action', api.state.ctActionList);
        if (typeof tempTabObj.props.button_props === 'string' || !tempTabObj.props.button_props) {
            tempTabObj.props.button_props = JSON.parse(tempTabObj.props.button_props || '{}');
        }
        if (typeof tempTabObj.props.recommendation_dialog_props === 'string' || !tempTabObj.props.recommendation_dialog_props) {
            tempTabObj.props.recommendation_dialog_props = JSON.parse(tempTabObj.props.recommendation_dialog_props || '{}');
        }

        if (!tempTabObj.hasOwnProperty('isRefineCountInValid')) {
            tempTabObj.isRefineCountInValid = false;
        }
        tempTabObj.props.enable_granular_feedback = getBooleanValue(tempTabObj.props.enable_granular_feedback);
        tempTabObj.props.recommendation_dialog_props.refineCount = getNumberValue(tempTabObj.props.recommendation_dialog_props.refineCount);
        if (!tempTabObj.props.recommendation_dialog_props.hasOwnProperty('setRefineCount')) {
            tempTabObj.props.recommendation_dialog_props.setRefineCount = false;
        }
        tempTabObj.props.recommendation_dialog_props.setRefineCount = getBooleanValue(tempTabObj.props.recommendation_dialog_props.setRefineCount);
        tempTabObj.props.enable_extended_tables = getBooleanValue(tempTabObj.props.enable_extended_tables);
        if (!tempTabObj.props.recommendation_dialog_props.setRefineCount) {
            delete tempTabObj.props.recommendation_dialog_props.refineCount;
        }
        tempTabObj.props.is_config_tab_visited = true;


        if (isTabListUpdated) {
            api.setState('tabs', tabsData);
        }
        // Uncomment this when we enable feedback feature
        // formatFeedback(tempTabObj, 'positive_feedback');
        // formatFeedback(tempTabObj, 'negative_feedback');
        let tempCurrentRefineMessage = api.state.errorObjForRefineCount;
        tempCurrentRefineMessage = setErrorMessageForRefineCount(tempTabObj.props.recommendation_dialog_props.refineCount || 0, tempCurrentRefineMessage);
        tempTabObj.isRefineCountInValid = tempCurrentRefineMessage.isInValid;
        tempTabObj.isButtonLabelSet = tempTabObj.isButtonLabelSet || false;
        tempTabObj.tabIndex = tabIndex;
        if (!tempTabObj.props.isPresetActionInValid) {
            tempTabObj.props.isPresetActionInValid = false;
        }
        api.setState('errorObjForRefineCount', tempCurrentRefineMessage);
        api.setState('selectedButtonConfig', tempTabObj);
        api.setState('selectdTabId', tabId);
        api.setState('selectedTabIndex', tabIndex);
        updateNAcmConfig(tempTabObj);
    }

    function updateConfigReviewStatus(selectedButtonConfig) {
        if (selectedButtonConfig.index === 0 && !api.state.isFirstTabReviewed) {
            api.setState('isFirstTabReviewed', true);
        }
        selectedButtonConfig.props.is_config_reviewed = true;
    }

    function updateNAcmConfig(selectedTabDataObj, keysToUpdate = []) {
        let tempNAcmConfig = api.state.nacmConfig;
        let currentNacmVarSet = tempNAcmConfig.variable_sets[0];
        let currentButtonConfig = selectedTabDataObj ? selectedTabDataObj : selectedButtonConfig;
        currentButtonConfig = JSON.parse(JSON.stringify(currentButtonConfig));
        tempNAcmConfig.shouldSkipRecommendationDialogReset = true;
        if (!currentNacmVarSet) {
            currentNacmVarSet = {
                name: currentButtonConfig.name,
                config_type: currentButtonConfig.config_type,
                props: {}
            }
        } else {
            currentNacmVarSet = JSON.parse(JSON.stringify(currentNacmVarSet))
        }
        let keysToCheck = Object.keys(currentButtonConfig.props);
        keysToUpdate = keysToUpdate.length ? keysToUpdate : keysToCheck;
        for (let propKey of keysToUpdate) {
            if (['button_props', 'recommendation_dialog_props'].includes(propKey)) {
                currentNacmVarSet.props[propKey] = typeof currentButtonConfig.props[propKey] === 'object' ? JSON.stringify(currentButtonConfig.props[propKey]) : currentButtonConfig.props[propKey];
            } else if (propKey.includes('enable_granular_feedback')) {
                currentNacmVarSet.props.enable_granular_feedback = currentButtonConfig.props.enable_granular_feedback;
                currentNacmVarSet.props.feedbackProps = {};
                if (currentButtonConfig.props.enable_granular_feedback) {
                    currentNacmVarSet.props.feedbackProps.positiveFeedback = _formatFeedbackPropsForNAcmConfig(currentButtonConfig.props, 'positive_feedback');
                    currentNacmVarSet.props.feedbackProps.negativeFeedback = _formatFeedbackPropsForNAcmConfig(currentButtonConfig.props, 'negative_feedback');
                }
            } else if (['preset_actions', 'refine_actions', 'call_to_action', 'default_preset_action'].includes(propKey)) {
                let newFilteredActions = [];
                let currentActions = Array.isArray(currentButtonConfig.props[propKey]) ? currentButtonConfig.props[propKey] : propKey === 'default_preset_action' && currentButtonConfig.props[propKey]?.id ? [currentButtonConfig.props[propKey]] : [];
                currentActions.forEach((actionObj) => {
                    if (actionObj.active) {
                        newFilteredActions.push(actionObj);
                    }
                });
                currentNacmVarSet.props[propKey] = newFilteredActions;
                if (propKey === 'default_preset_action') {
                    currentNacmVarSet.props[propKey] = currentNacmVarSet.props[propKey][0] || {};
                }
            } else {
                currentNacmVarSet.props[propKey] = currentButtonConfig.props[propKey];
            }
        }

        currentNacmVarSet.props.wwna_component_id = 'nacm-dev-preview-kayj';
        currentNacmVarSet.props = {
            ...currentNacmVarSet.props,
            ...api.state.generalDetails.props
        }

        tempNAcmConfig.variable_sets = [currentNacmVarSet];

        api.setState('nacmConfig', JSON.parse(JSON.stringify(tempNAcmConfig)));
        api.emit('REFRESH_STATE', {});
    }

    function _formatFeedbackPropsForNAcmConfig(props, key) {
        let keyForItems = key + '_items';
        props = JSON.parse(JSON.stringify(props));
        if (props[key]) {
            props[key] = typeof props[key] === 'object' ? props[key] : typeof props[key] == 'string' && props[key].length > 2 ? JSON.parse(props[key]) : {};
            if (props[key]?.items?.length) {
                props[key].items = typeof props[key].items === 'object' ? props[key].items : typeof props[key].items == 'string' && props[key].items.length > 2 ? JSON.parse(props[key].items) : [];
                if (props[keyForItems]?.length) {
                    let newItemsList = [];
                    props[key].items = props[key].items.map((feedbackItemObj) => {
                        if (['checklist', 'radio'].includes(feedbackItemObj.type) && feedbackItemObj.value?.length) {
                            let newValueArr = [];
                            props[keyForItems].forEach((valueObj) => {
                                if (valueObj.checked) {
                                    delete valueObj.checked;
                                    newValueArr.push(valueObj);
                                }
                            });
                            feedbackItemObj.value = newValueArr;
                        }
                        return feedbackItemObj;
                    });
                }
            }
            return props[key];
        } else {
            return {};
        }
    }

    function formatSelectedActions(actionsArray) {
        let hasInActiveActions = false;
        actionsArray = JSON.parse(JSON.stringify(actionsArray));
        actionsArray = actionsArray.map((actionObj) => {
            if (!actionObj.active) {
                hasInActiveActions = true;
                actionObj.label = `${actionObj.originalLabel} (Inactive)`;
            }
            return actionObj;
        });
        return {
            hasInActiveActions,
            actions: actionsArray
        }
    }

    function setButtonLabel(selectedButtonConfig) {
        let isButtonSet = false;
        if (api.state.generalDetails.props.config_type === api.state.CONFIG_TYPE.SINGLE && selectedButtonConfig.props.variant === api.state.VARIANT_TYPE.FIXED && !selectedButtonConfig.isButtonLabelSet) {
            let tempLabelToSet = '';
            if (selectedButtonConfig.props['preset_actions'].length > 1) {
                tempLabelToSet = 'Now Assist';
            } else if (selectedButtonConfig.props['preset_actions'].length === 1) {
                tempLabelToSet = selectedButtonConfig.props['preset_actions'][0].label;
            } else if (selectedButtonConfig.props['default_preset_action']?.label) {
                tempLabelToSet = selectedButtonConfig.props['default_preset_action'].label;
            } else {
                tempLabelToSet = 'Now Assist';
            }

            selectedButtonConfig.props.button_props.label = tempLabelToSet;
            isButtonSet = true;
        }
        return isButtonSet;
    }

    function validatePresetActions(updatedSelectedButtonConfig) {
        let isValid = false;
        if (updatedSelectedButtonConfig.props.default_preset_action?.id && updatedSelectedButtonConfig.props.default_preset_action?.active) {
            isValid = true;
        } else if ((updatedSelectedButtonConfig.props.preset_actions || []).some((action) => action.active)) {
            isValid = true;
        }
        return !isValid;
    }


    switch (event.elementId) {
        case "existing_skill_config_list":
            let existingSkillConfigId = event.payload.context?.row?.key;
            if(existingSkillConfigId){
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url: `now/now-assist-admin/skill-guided-setup/${existingSkillConfigId}`,
                        target: '_blank'
                    }
                });
            }
            break;
        case "preset_actions_dropdown":
            let nacmPropsToBeUpdated = [];
            if (event.name === 'NOW_TYPEAHEAD_MULTI#INVALID_SET') {
                // selectedButtonConfig.props.isPresetActionInValid = event.payload.value;
            } else {
                selectedButtonConfig.props.isPresetActionInValid = false;
                let tempFormattedPresetActions = formatSelectedActions(event.payload.value);
                selectedButtonConfig.props['preset_actions'] = tempFormattedPresetActions.actions;
                selectedButtonConfig.props['hasInActivePresetActions'] = tempFormattedPresetActions.hasInActiveActions;
                nacmPropsToBeUpdated = ['preset_actions'];
                if (setButtonLabel(selectedButtonConfig)) {
                    nacmPropsToBeUpdated.push('button_props');
                }
            }
            updateConfigReviewStatus(selectedButtonConfig);
            selectedButtonConfig.props.isPresetActionInValid = validatePresetActions(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, nacmPropsToBeUpdated);
            break;
        case "refine_actions_dropdown":
            let tempFormattedRefineActions = formatSelectedActions(event.payload.value);
            selectedButtonConfig.props['refine_actions'] = tempFormattedRefineActions.actions;
            selectedButtonConfig.props['hasInActiveRefineActions'] = tempFormattedRefineActions.hasInActiveActions;
            updateConfigReviewStatus(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['refine_actions']);
            break;
        case "ct_actions_dropdown":
            let tempFormattedCTActions = formatSelectedActions(event.payload.value);
            selectedButtonConfig.props['call_to_action'] = tempFormattedCTActions.actions;
            selectedButtonConfig.props['hasInActiveCTActions'] = tempFormattedCTActions.hasInActiveActions;
            updateConfigReviewStatus(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['call_to_action']);
            break;
        case "default_preset_action":
            if (!event.name.includes('INVALID_SET')) {
                let tempFormattedDefaultPresetAction = formatSelectedActions(event.payload.item ? [event.payload.item] : []);
                selectedButtonConfig.props['default_preset_action'] = tempFormattedDefaultPresetAction.actions[0] || {
                    id: ""
                };
                selectedButtonConfig.props['hasInActiveDefaultPresetAction'] = tempFormattedDefaultPresetAction.hasInActiveActions;
            }

            updateConfigReviewStatus(selectedButtonConfig);
            selectedButtonConfig.props.isPresetActionInValid = validatePresetActions(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            let tempNacmPropsToBeUpdated = ['default_preset_action'];
            if (setButtonLabel(selectedButtonConfig)) {
                tempNacmPropsToBeUpdated.push('button_props');
            }
            updateNAcmConfig(selectedButtonConfig, tempNacmPropsToBeUpdated);
            break;
        case "tabs_2":
            let tabsData = api.state.tabs;
            setTabData(tabsData, event.payload);
            break;
        case "fetch_root_table_name":
            let tableNames = api.data.fetch_root_table_name.output;
            let refineQuery = actionQuery.getActionQuery(tableNames, 'refine');
            let presetQuery = actionQuery.getActionQuery(tableNames, 'preset');
            let ctActionQuery = actionQuery.getCTActionQuery(tableNames, 'callToAction');
            api.setState('refineActionFilter', refineQuery);
            api.setState('presetActionFilter', presetQuery);
            api.setState('ctActionFilter', ctActionQuery);
            break;
        case "fetch_refine_actions":
            let refineActions = formatActionList(api.data.fetch_refine_actions.results);
            let tempSelectedConfigRefineAction = setActionListForSelectedTab(selectedButtonConfig, 'refine_actions', refineActions);
            api.setState('selectedButtonConfig', tempSelectedConfigRefineAction);
            api.setState('refineActionList', refineActions);
            break;
        case "fetch_preset_actions":
            let presetActions = formatActionList(api.data.fetch_preset_actions.results);
            let tempSelectedConfigPresetAction = setActionListForSelectedTab(selectedButtonConfig, 'preset_actions', presetActions);
            tempSelectedConfigPresetAction = setActionListForSelectedTab(tempSelectedConfigPresetAction, 'default_preset_action', presetActions);
            api.setState('selectedButtonConfig', tempSelectedConfigPresetAction);
            api.setState('presetActionList', presetActions);
            break;
        case "fetch_ct_actions":
            let ctActions = formatActionList(api.data.fetch_ct_actions.results);
            let tempSelectedConfigCtAction = setActionListForSelectedTab(selectedButtonConfig, 'call_to_action', ctActions);
            api.setState('selectedButtonConfig', tempSelectedConfigCtAction);
            api.setState('ctActionList', ctActions);
            break;
        case "fetch_guided_setup_config":
            let actionTemplateConfig = api.data.fetch_guided_setup_config.output;
            let dummyTabsArray = [];
            let firstTabLabel = '';
            if (actionTemplateConfig.override_sets.length) {
                actionTemplateConfig.override_sets.forEach((overrideSetObject, index) => {
                    if (!overrideSetObject.name) {
                        overrideSetObject.name = getTitle(overrideSetObject.title);
                    }
                    if (!overrideSetObject.sys_id) {
                        overrideSetObject.sys_id = overrideSetObject.props.sys_id;
                        overrideSetObject.sysId = overrideSetObject.sys_id;
                    }
                    dummyTabsArray.push({
                        id: overrideSetObject['sys_id'],
                        index: index,
                        label: overrideSetObject['name'],
                        ...overrideSetObject
                    });

                    if (index === 0) {
                        if (getBooleanValue(overrideSetObject.props.is_config_reviewed)) {
                            api.setState('isFirstTabReviewed', true);
                        }
                        setModalContent(overrideSetObject['name']);
                    }
                });
                if (api.state.generalDetails.props.config_type === api.state.CONFIG_TYPE.SINGLE) {
                    setTabData(dummyTabsArray, {
                        selectedTabIndex: 0
                    });
                }
                api.setState('tabs', dummyTabsArray);
            }
            break;
        case "button_label":
        case "button_tooltip":
            let buttonPropKeyToUpdate = event.elementId === 'button_label' ? 'label' : 'tooltipContent';
            selectedButtonConfig.props.button_props[buttonPropKeyToUpdate] = event.payload.fieldValue || event.payload.value;
            if (buttonPropKeyToUpdate === 'label') {
                selectedButtonConfig.isButtonLabelSet = true;
            }
            updateConfigReviewStatus(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['button_props']);
            break;
        case "set_refine_action_count":
            let setRefineCountValue = event.payload.value;
            selectedButtonConfig.props.recommendation_dialog_props['setRefineCount'] = setRefineCountValue;
            if (!setRefineCountValue) {
                delete selectedButtonConfig.props.recommendation_dialog_props.refineCount;
            }
            updateConfigReviewStatus(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['recommendation_dialog_props']);
            break;
        case "refine_action_count":
            let currentMessageObj = api.state.errorObjForRefineCount;
            let refineCountValue = event.payload.fieldValue;
            currentMessageObj = setErrorMessageForRefineCount(refineCountValue, currentMessageObj);
            selectedButtonConfig.isRefineCountInValid = currentMessageObj.isInValid;
            api.setState('errorObjForRefineCount', currentMessageObj);
            selectedButtonConfig.props.recommendation_dialog_props['refineCount'] = refineCountValue;
            updateConfigReviewStatus(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['recommendation_dialog_props']);
            break;
        case "enable_feedback_toggle":
            selectedButtonConfig.props.enable_granular_feedback = event.payload.value;
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateConfigReviewStatus(selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['enable_granular_feedback']);
            break;
        case "positive_feedback_toggle":
        case "negative_feedback_toggle":
            let followUpKeyToUpdate = event.elementId.includes('positive') ? 'positive_feedback' : 'negative_feedback';
            selectedButtonConfig.props[followUpKeyToUpdate].showFollowUpQuestions = event.payload.value;
            updateConfigReviewStatus(selectedButtonConfig);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            break;
        case "positive_item_checkboxes":
        case "negative_item_checkboxes":
            let checkBoxKeyToUpdate = event.elementId.includes('positive') ? 'positive_feedback_items' : 'negative_feedback_items';
            let index = event.context.item.index;
            let checkBoxValue = event.payload.value;
            if (selectedButtonConfig.props[checkBoxKeyToUpdate]?.[index]) {
                selectedButtonConfig.props[checkBoxKeyToUpdate][index].checked = checkBoxValue;
            }
            api.setState('selectedButtonConfig', selectedButtonConfig);
            updateConfigReviewStatus(selectedButtonConfig);
            updateNAcmConfig(selectedButtonConfig, ['enable_granular_feedback']);
            break;
        case "fetch_admin_configurations":
            let adminConfigOutput = api.data.fetch_admin_configurations.output;
            if (adminConfigOutput?.shouldDisableFields) {
                api.setState('fieldsToDisable', adminConfigOutput.fieldToDisable || {});
            }
            break;
        case "fetch_configurations":
            let configurationOutput = api.data.fetch_configurations.output;
            let maxCount = configurationOutput.MAX_VALUE_FOR_REFINE_COUNT;
            if (configurationOutput.CONFIG_TYPE) {
                api.setState('CONFIG_TYPE', configurationOutput.CONFIG_TYPE);
            }
            if (configurationOutput.VARIANT_TYPE) {
                api.setState('VARIANT_TYPE', configurationOutput.VARIANT_TYPE);
            }
            if (Number.isInteger(maxCount)) {
                api.setState('MAX_VALUE_FOR_REFINE_COUNT', maxCount);
                helpers.translate('Enter a number from 1 to {0}', [maxCount]).then((message) => {
                    translateAndSaveErrorMessage('defaultRefineCountAlert', message);
                    translateAndSaveErrorMessage('errorMessageForRefineCount', message);
                });
                helpers.translate('Decimal values are not allowed. Please enter a number from 1 to {0}', [maxCount]).then((message) => {
                    translateAndSaveErrorMessage('errorMessageForDecimalPlaces', message);
                });
            }
            break;
        case "modal_cancel_button":
        case "confirmation_modal":
            api.setState('modalConfirmationValue', 'no');
            helpers.modal.close('confirmation_modal');
            break;
        case "modal_submit_button":
            api.setState('modalConfirmationValue', 'yes');
            let tempTabsData = api.state.tabs;
            let firstTabData = tempTabsData[0];
            api.setState('shouldAutoFill', true);
            tempTabsData = tempTabsData.map((tempTabObj) => {
                if (!getBooleanValue(tempTabObj.props.is_config_tab_visited)) {
                    tempTabObj = updateCurrentConfigObj(tempTabObj, firstTabData);
                }
                return tempTabObj;
            });
            api.setState('tabs', JSON.parse(JSON.stringify(tempTabsData)));
            helpers.modal.close('confirmation_modal');
            setTabData(tempTabsData, {
                selectedTabIndex: selectedButtonConfig.index
            }, true);

            break;
        case "restart_preview":
            let tempNacmConfig = api.state.nacmConfig;
            let tempNacmComponentId = api.state.nacmComponentId;
            api.setState('nacmConfig', {});
            api.setState('nacmComponentId', '');
            api.setState('isPreviewLoading', true);

            helpers.timing.setTimeout(function() {
                tempNacmConfig.shouldSkipRecommendationDialogReset = false;
                api.setState('nacmConfig', JSON.parse(JSON.stringify(tempNacmConfig)));
                api.setState('nacmComponentId', tempNacmComponentId);
                api.setState('isPreviewLoading', false);
            }, 1000);
            break;
        case "extended_table_support_toggle":
            selectedButtonConfig.props.enable_extended_tables = event.payload.value;
            updateNAcmConfig(selectedButtonConfig, ['enable_extended_tables']);
            api.setState('selectedButtonConfig', selectedButtonConfig);
            break;
    }

    async function validateAndSaveData(guided_context = {}, payload, tabsArray) {
        let tabsData = tabsArray || api.state.tabs;
        let currentConfig = api.state.selectedButtonConfig;
        currentConfig = JSON.parse(JSON.stringify(currentConfig));
        currentConfig = reformatAndSaveTabData(tabsData, currentConfig);
        let isRefineCountInValid = false;
        let isPresetActionInValid = false;
        const configType = api.state.generalDetails.props.config_type;
        // let showConfirmationModal = shouldShowModal(null, tabsData, false);
        // const isAllConfigReviewCheckRequired = api.state.generalDetails.props.config_type === api.state.CONFIG_TYPE.TABLE ? true : false;
        let isAllConfigTabVisited = true;
        let isAnyDataPointInvalid = tabsData.some((tabObj) => {
            if (tabObj.isRefineCountInValid) {
                isRefineCountInValid = true;
            }
            if (tabObj.props.isPresetActionInValid || (!tabObj.props.preset_actions?.length && !tabObj.props.default_preset_action?.length)) {
                isPresetActionInValid = true;
            }
            // if (!showConfirmationModal && isAllConfigReviewCheckRequired && shouldAutoFill(tabObj, tabsData)) {
            //     tabObj = updateCurrentConfigObj(tabObj, tabsData[0]);
            // }
            return isRefineCountInValid || isPresetActionInValid;
        });

        if (isRefineCountInValid) {
            let translatedRefineCountMessage = await helpers.translate("Please enter a valid number for the 'Maximum refinements' field.");
            addNotification('critical', translatedRefineCountMessage);
            return;
        }

        if (isPresetActionInValid) {
            let translatedPresetActionMessage
            if (configType === api.state.CONFIG_TYPE.TABLE) {
                translatedPresetActionMessage = await helpers.translate('Please select at least one active trigger action for the selected form fields.');
            } else {
                translatedPresetActionMessage = await helpers.translate('Please select at least one active trigger action.');
            }

            addNotification('critical', translatedPresetActionMessage);
            return;
        }

        // if (showConfirmationModal) {
        //     // api.setState('hasShownConfirmation', true);
        //     api.setState('isModalOpenedFromValidateAndSave', true);
        //     helpers.modal.open('confirmation_modal');
        //     return;
        // }

        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_SAVE_VAR_SET_DATA',
            eventPayload: {
                varSetId: api.state.currentVarSetId,
                moveToNextStep: false,
                payload: {
                    override_sets: tabsData
                },
                forceSave: true
            }
        });

        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_SAVE_VAR_SET_DATA',
            eventPayload: {
                varSetId: api.state.currentVarSetId,
                moveToNextStep: true,
                payload: {
                    override_sets: tabsData
                },
                forceSave: true
            }
        });
    }


    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SN_NS_ADMIN_OVERRIDE_SAVE',
        eventPayload: {
            overrideFunction: validateAndSaveData
        }
    });
}
