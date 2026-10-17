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
    const commMgmtUXFBaseUtil = imports["sn_uib_tcm.CommunicationManagementUXFClientBaseUtil"]();
    const eventName = event.name;
    const channelResult = api.data.get_comm_task_channel_details.output.data;
    const dexChannelData = channelResult['dex_desktop_assistant'];

    const setDexInititialValue = () => {
        if (!dexChannelData || !dexChannelData.available)
            return;
        let dexChannelConfig = { ...api.state.dexChannelConfig
        };
        dexChannelConfig.isValid = true;
        dexChannelConfig.users = dexChannelData['recipients'];
        dexChannelConfig.title = dexChannelData['title'];
        api.setState('dexChannelConfig', dexChannelConfig);
    };

    const updateDexUsers = () => {
        let dexChannelConfig = { ...api.state.dexChannelConfig
        };
        dexChannelConfig.users = event.payload.value;
        api.setState('dexChannelConfig', dexChannelConfig);
    };

    if (channelResult && channelResult["dex-desktop-assistant"] && channelResult["dex-desktop-assistant"].available === false){
        let items = [{
            "action": {
                "type": "dismiss"
            },
            "content": await helpers.translate("DEX Desktop Assistant channel is turned off for communication. Please contact your system administrator."),
            "icon": "info-circle-outline",
            "id": `compose-communication-failed-error`,
            "status": "info", 
        }];
        
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: items,
        });
    }

    switch (eventName) {
        case "DATA_FETCH_SUCCEEDED":
            if (event.elementId == "get_comm_task_channel_details")
                setDexInititialValue();
            else if (event.elementId == "dex_search_recipients")
                api.setState("dexSearchResult", commMgmtUXFBaseUtil.populateSearchResult(api.data.dex_search_recipients.output));
            break;
        case "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET":
            updateDexUsers();
            break;
        case "NOW_TEXTAREA#INVALID_SET":
            api.setState("fieldsFilled",false);
            break;
        case "NOW_SELECT#SELECTED_ITEM_SET":
            if (event.payload.value == api.state.selectedDexTemplateId)
                break;
            api.setState("currentDexTemplateId", event.payload.value);
            helpers.modal.open("dex_template_modal");
            break;
        case "NOW_CONFIRM_MODAL#NEGATIVE_BUTTON_CLICKED":
            api.setState("currentDexTemplateId", api.state.selectedDexTemplateId);
            helpers.modal.close("dex_template_modal");
            break;
        case "NOW_CONFIRM_MODAL#POSITIVE_BUTTON_CLICKED":
            api.setState("selectedDexTemplateId", api.state.currentDexTemplateId);
            break;
    };
    
}
