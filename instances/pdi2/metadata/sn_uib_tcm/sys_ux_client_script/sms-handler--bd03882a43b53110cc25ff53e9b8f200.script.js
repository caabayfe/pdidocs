/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

    const eventName = event.name;
    const smsChannel = api.data.get_comm_task_channel_details.output.data && api.data.get_comm_task_channel_details.output.data.sms;
    if (!smsChannel || !smsChannel.available) {
        return;
    }
    const setIntitialValue = () => {
        let smsConfig = {...api.state.smsConfig};
        //From
        let notifyNumbers = smsChannel.notifyNumbers;
        let selectedNotifyNumber;
        let fromNumber = "";
        let defaultIndex = 0;
        for (var i = 0; i < notifyNumbers.length; i++) {
            notifyNumbers[i].id = notifyNumbers[i].sysId;
            notifyNumbers[i].label = notifyNumbers[i].name;
            if (notifyNumbers[i].defaultFlag) {
                defaultIndex = i;
            }
        }
        if (notifyNumbers.length > defaultIndex) {
            selectedNotifyNumber = notifyNumbers[defaultIndex].sysId;
            fromNumber = notifyNumbers[defaultIndex].number;
        }
        smsConfig.selectedNotifyNumber = selectedNotifyNumber;
        smsConfig.availableNotifyNumbers = notifyNumbers;

        //To
        let selectedSMSRecipients = [];
        let toNumbers = [];
        let recipients = smsChannel.recipients;
        let recipLen = recipients.length;
        let count = 0;
        for (var i = 0; i < recipLen; i++) {
            selectedSMSRecipients.push({
                id: recipients[i].sys_id,
                label: recipients[i].name,
                type: "sys_user"
            });
        }
        
        smsConfig.selectedRecipients = selectedSMSRecipients;
        smsConfig.from = fromNumber;
        api.setState("smsConfig", smsConfig);

        api.setState("selectedSmsTemplateId", smsChannel.template_id);
        api.setState("currentSmsMessage", smsChannel.message);
    };

    const updateSMSFrom = () => {
        const fromNumber = event.payload.items[0] && event.payload.items[0].number;
        let smsConfig = api.state.smsConfig;
        smsConfig.from = fromNumber;
        api.setState("smsConfig", smsConfig);
    };

    const updateSMSTo = () => {
        let toNumbers = "";
        let count = 0;
        let selectedRecipients = event.payload.value || [];
        let smsConfig = api.state.smsConfig;
        smsConfig.selectedRecipients = selectedRecipients;
        api.setState("smsConfig", smsConfig);
    };

    const updateSMSMessage = () => {
        let smsConfig = api.state.smsConfig;
        smsConfig.message = event.payload.value;
        api.setState("smsConfig", smsConfig);
    };

    const getSMSContacts = () => {
        const searchQuery = event.payload.value;
        const DEBOUNCE_THRESHOLD = 500;
        api.setState('getSMSContactDebounceTimeoutId', ({
            currentValue
        }) => {
            let timeoutId = currentValue || null;
            if (timeoutId) {
                helpers.timing.clearTimeout(timeoutId);
            }
            timeoutId = helpers.timing.setTimeout(() => {
                api.setState('getSMSContactDebounceTimeoutId', null);
                api.setState("smsSearchQuery", searchQuery);
            }, DEBOUNCE_THRESHOLD);
            return timeoutId;
        });
    };

    switch (eventName) {
        case "DATA_FETCH_SUCCEEDED":
            if (event.elementId == "get_comm_task_channel_details") {
                setIntitialValue();
            }
            else if (event.elementId == "sms_search_recipients") {
                const commMgmtUXFBaseUtil = imports["sn_uib_tcm.CommunicationManagementUXFClientBaseUtil"]();
                api.setState("smsSearchResults", commMgmtUXFBaseUtil.populateSearchResult(api.data.sms_search_recipients.output));
            }
            break;
        case "NOW_DROPDOWN#SELECTED_ITEMS_SET":
            updateSMSFrom();
            break;
        case "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET":
            updateSMSTo();
            break;
        case "NOW_TEXTAREA#VALUE_SET":
        case "NOW_TEXTAREA#INPUT":
            updateSMSMessage();
            break;
        case "NOW_TYPEAHEAD_MULTI#VALUE_SET":
            getSMSContacts();
            break;
        case "NOW_TEXTAREA#INVALID_SET":
            api.setState("fieldsFilled",false);
            break;
        case "NOW_SELECT#SELECTED_ITEM_SET":
            api.setState("selectedSmsTemplateId", event.payload.value);
            helpers.modal.open("smsTemplateModal");
            break;
        case "NOW_CONFIRM_MODAL#NEGATIVE_BUTTON_CLICKED":
            api.setState("selectedSmsTemplateId", api.state.currentSmsTemplateId);
            helpers.modal.close("smsTemplateModal");
            break;
        case "NOW_CONFIRM_MODAL#POSITIVE_BUTTON_CLICKED":
            api.setState("currentSmsTemplateId", api.state.selectedSmsTemplateId);
            break;
    };
}
