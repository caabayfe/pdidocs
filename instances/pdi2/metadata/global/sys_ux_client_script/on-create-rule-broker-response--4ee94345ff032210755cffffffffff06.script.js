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
    const {STATE, RULE_TYPE, UI_ELEMENT_ID, MESSAGE_TYPE, ERROR_CODES, EVENT, COLUMNS } = imports["global.DMClientConstants"]();
    const { sysID, status, messages, redirectUrl, rollbackExcludedList, errorCode, infoMsgs, destroy_rule } = event.payload.data?.output || {};
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { getFormattedMessage, pushMessage, clearMessages, UI_MESSAGE, BR_MESSAGE, BR_TRANSFORM_MESSAGE } = imports["global.DMClientMessageHandler"]();
    const { isEditFlow } = api.state;

    function showError(stateVarName, message) {
        const uiElement = deepClone(api.state[stateVarName]);
        uiElement.message = message;
        uiElement.type = MESSAGE_TYPE.CRITICAL;
        uiElement.hide = false;
        uiElement.isValid = false;
        api.setState(stateVarName, uiElement);
    }
    // Decoding the strings to remove encoded strings like "&#39;"
    function decodeError(str) {
        return str.replace(/&#(\d+);/g, (match, dec) => {
            return String.fromCharCode(dec);
        })
    }
    const allBRMessages = messages ? messages.concat(infoMsgs ? infoMsgs : []) : [] 
    clearMessages(api, helpers);// clear last action messages
    if(status == "error") {
        var ruleType = api.state.selectedRuleType;
        if(isEditFlow) {
            const message = await getFormattedMessage(api, helpers, UI_MESSAGE.RULE_INVALID_UPDATE);
            const archiveNoConditionMessage = await getFormattedMessage(api, helpers, UI_MESSAGE.ARCHIVE_ACTIVE_RULE_NO_CONDITION);
            showError(STATE.RULE_UPDATE_ALERT, message);
            if (ruleType == RULE_TYPE.ARCHIVE && api.state.ruleData[ruleType].active && api.state.ruleData[ruleType].condition == ""){
                pushMessage(api, helpers, {message: archiveNoConditionMessage, type: MESSAGE_TYPE.INFO});
            }
            
        }

        if ((errorCode == ERROR_CODES.EMPTY_SCHEDULE_TIME)
            || (errorCode == ERROR_CODES.PAST_SCHEDULE_TIME)) {
            showError(STATE.EXECUTION_TIME_ALERT, messages[0]);
            return;
        }


        var decodedMessages = deepClone(api.state.messages);
        const maxDurationExceededMsg = await getFormattedMessage(api, helpers, BR_TRANSFORM_MESSAGE.AGE_DURATION_EXCEEDED);
        messages.forEach(message => {
            const businessRuleMessages = BR_MESSAGE;
            const decodedMessage = decodeError(message);
            if(decodedMessage == BR_MESSAGE.AGE_DURATION_EXCEEDED) {
                    showError(STATE.AGE_FIELD_ALERT, maxDurationExceededMsg);
            } else if (errorCode == ERROR_CODES.REARCHIVE_DURATION_ERROR) {
                const archiveDurationAlert = deepClone(api.state[STATE.ARCHIVE_DURATION_ALERT]);
                archiveDurationAlert.rearchive.message = decodedMessage;
                archiveDurationAlert.rearchive.type = MESSAGE_TYPE.CRITICAL;
                archiveDurationAlert.rearchive.hide = false;
                api.setState(STATE.ARCHIVE_DURATION_ALERT, archiveDurationAlert);
            } else {
                pushMessage(api, helpers, {message: decodedMessage, type: MESSAGE_TYPE.CRITICAL})
            }
        });

    }


    if(sysID) {
        var ruleData = api.state.ruleData;
        var ruleType = api.state.selectedRuleType;
        ruleData[ruleType]["sys_id"] = sysID;
        api.setState("ruleData", ruleData);
        if (status == "success") {

            // Update destroy rule sysId;
            if(destroy_rule) {
                if(destroy_rule.status == "success") {
                    //Update RuleData (link, or unlink destroy Rule sysId)
                    const ruleObj = deepClone(api.state[STATE.RULE_DATA]);
                    ruleObj[RULE_TYPE.ARCHIVE][COLUMNS.DESTROY_RULE] = destroy_rule.sysID;
                    api.setState(STATE.RULE_DATA, ruleObj);
                }
            }
            
            if(!isEditFlow) {
                // Navigate to next page
                // Get the concerned tabs for the selected rule type.
                var allTabs = api.state.tabsForContentTree;
                var selectedRuleType = api.state.selectedRuleType;
                var currentTabs = allTabs[selectedRuleType];
                if(!currentTabs.length) return;

                // Get the current tab from state slice selectedTabId
                var selectedTabId = api.state.selectedTabId;
                var selectedTabIndex = currentTabs.findIndex(tab => tab['id'] == selectedTabId);
                var selectedTab = currentTabs[selectedTabIndex];

                // Update status and disabled attribute on both tabs.
                selectedTab.statuses = [{"type": "icon", "icon": "circle-check-outline"}];
                selectedTab.disabled = false;

                // Get next tab as well and update it to be selected
                var nextTab = currentTabs[selectedTabIndex + 1];
                if(nextTab) {
                    api.setState("selectedTabId", nextTab.id);
                    nextTab.statuses = [{"type": "icon", "icon": "circle-semi-check-outline"}];
                    nextTab.disabled = false;
                }
                api.setState("tabsForContentTree", allTabs);

                if(ruleType == RULE_TYPE.ARCHIVE && api.state.ruleData[ruleType].active) { 
                    const archiveActivationMessages = [BR_MESSAGE.ARCHIVE_JOB_RUNNING, BR_MESSAGE.NEXT_ARCHIVE_RUN_IN, BR_MESSAGE.NO_ARCHIVE_SCHEDULED_JOB_FOUND] 
                    if(allBRMessages && allBRMessages.length > 0) {
                        allBRMessages.forEach((message) => {
                            archiveActivationMessages.forEach((archiveActivationMessage) => {
                                if(message.startsWith(archiveActivationMessage)) {
                                    api.setState(STATE.ARCHIVE_ACTIVATION_MESSAGE, message);
                                }
                            });
                        });
                    }
                }

                if(selectedTabId.includes("view_summary")) {
                    api.emit(EVENT.OPEN_RULE_SUCCESS_POPUP, {});
                }
            }
            if(redirectUrl) {
                api.setState("redirectURLForOTDProgress", redirectUrl);
            }
            if (rollbackExcludedList) {
                if(rollbackExcludedList.length > 0) {
                    const ruleObj = deepClone(api.state.ruleData);
                    ruleObj[RULE_TYPE.ONETIME_DELETE][UI_ELEMENT_ID.RECORD_ROLLBACK] = false;
                    api.setState(STATE.RULE_DATA, ruleObj);
                }
                api.setState(STATE.ROLLBACK_EXCLUDED_LIST, rollbackExcludedList);
            }
            //Update savedRuleData
            const ruleData = deepClone(api.state[STATE.RULE_DATA]);
            api.setState(STATE.SAVED_RULE_DATA, ruleData);
            if(isEditFlow) {
                const ruleUpdateAlert = deepClone(api.state[STATE.RULE_UPDATE_ALERT]);
                ruleUpdateAlert.hide = false;
                ruleUpdateAlert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.RULE_UPDATE_SUCCESS);
                ruleUpdateAlert.type = MESSAGE_TYPE.POSITIVE;
                api.setState(STATE.RULE_UPDATE_ALERT, ruleUpdateAlert);
            }

            //Upon successfully creating or updating a rule, certain BRs display informational messages.
            if(isEditFlow){
                infoMsgs.forEach(message => {
                    const decodedMessage = decodeError(message);
                    pushMessage(api, helpers, {message: decodedMessage, type: MESSAGE_TYPE.INFO});
                });
            }
        }
    }
}
