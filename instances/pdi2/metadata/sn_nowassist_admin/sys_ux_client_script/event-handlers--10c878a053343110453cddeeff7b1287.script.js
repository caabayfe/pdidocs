/**

@param {params} params
@param {api} params.api
@param {any} params.event
@param {any} params.imports
@param {ApiHelpers} params.helpers
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
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    const TURN_ON_MODAL = 'aeed-1f67-a99a9a-6e66-a88bb8a9';
    const TURN_ON_SUCCESS_MODAL = '1077-6296-abb9b9-abf2-aa9a0d8b';
    const TURN_OFF_MODAL = '0d6a-5dda-9aa989-04ea-b8a87b9b';
    switch (eventName) {
        case 'TURN_ON_PANEL#CLICKED':
            //aceUtils.refreshContentBlock('user_roles'); As no roles are there as of now. Commenting this.
            aceUtils.openModal(TURN_ON_MODAL);
            break;
        case 'SAVE_AND_TURN_ON#CLICKED':
            aceUtils.refreshContentBlock('enable_nap');
            if (!blockcontext.isPanelEnabled) {
                aceUtils.openModal(TURN_ON_SUCCESS_MODAL);
                aceUtils.getContext().then((context) => {
                    context.isPanelDisabled = false;
                    context.isPanelEnabled = true;
                    aceUtils.setContext(context);
                });
            } else {
                aceUtils.dismissModal(TURN_ON_MODAL);
            }
            trackUsage("Turn on Now Assist Panel", {});
            break;
        case 'USER_ROLES#SELECTED':
            blockcontext.UserRoles = eventPayload.value;
            publish();
            break;
        case 'CANCEL#CLICKED':
            aceUtils.dismissModal(TURN_ON_MODAL);
            break;
        case 'TURN_OFF_PANEL#CLICKED':
            aceUtils.openModal(TURN_OFF_MODAL);
            break;
        case "TOGGLE_VOICE_INPUT#CHECKED_SET":
            aceUtils.refreshContentBlock('toggle_voice_input').then(function() {
                trackUsage(`Turn ${blockcontext.isVoiceInputEnabled?"Off":"On"} Voice input`, {});
                aceUtils.getContext().then((context) => {
                    context.isVoiceInputEnabled = !context.isVoiceInputEnabled;
                    aceUtils.setContext(context);
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "toggle_voice_input_alert",
                            status: context.isVoiceInputEnabled ? "positive" : "info",
                            icon: context.isVoiceInputEnabled ? "circle-check-outline" : "circle-info-outline",
                            header: context.isVoiceInputEnabled ? context.turnOnVoiceInputSuccessHeader : context.turnOffVoiceInputSuccessHeader,
                            content: context.isVoiceInputEnabled ? context.turnOnVoiceInputSuccessMessage : context.turnOffVoiceInputSuccessMessage,
                            action: {
                                "type": "dismiss"
                            }
                        }]
                    });
                });
            });
            break;
        case 'TURN_OFF#CLICKED':
            aceUtils.refreshContentBlock('turn_off_panel').then(function() {
                aceUtils.setContext({ ...blockcontext,
                    isVoiceInputEnabled: false
                });
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "turn_off_alert",
                        status: "info",
                        icon: "circle-info-outline",
                        content: {
                            type: "html",
                            value: blockcontext.turnOffSuccessMessage
                        },
                        action: {
                            "type": "dismiss"
                        }
                    }]
                });
                aceUtils.refreshContentBlock('is_panel_enabled');
                aceUtils.dismissModal(TURN_OFF_MODAL);
                helpers.timing.setTimeout(() => {
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: 'now/now-assist-admin/now-assist-panel',
                            target: "_self"
                        }
                    });
                }, 2000);
            });
            trackUsage("Turn off Now Assist Panel", {});
            break;
        case 'TURN_OFF_CANCEL#CLICKED':
            aceUtils.dismissModal(TURN_OFF_MODAL);
            break;
        case "HELPFUL_RESOURCES#CLICKED":
            trackUsage("Clicked Helpful Resources", {
                name: eventPayload?.item?.label
            });
            break;
        case "FAQ#EXPANDED":
            trackUsage("Opened FAQ", {
                name: eventPayload?.item?.question
            });
            break;
        case "ALERT#ACTIONCLICKED":
            blockcontext.showVoiceInputAlert = false;
            publish();
            break;
        case "ACE_MODAL_CLOSED":
            if (eventPayload?.contents?.elementId === TURN_ON_SUCCESS_MODAL) {
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url: 'now/now-assist-admin/now-assist-panel',
                        target: "_self"
                    }
                });
            }
            break;
    }

    function publish() {
        aceUtils.setContext(blockcontext);
    }
}
