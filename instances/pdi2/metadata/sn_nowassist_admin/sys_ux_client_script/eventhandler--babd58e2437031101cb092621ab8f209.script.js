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
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    switch (eventName) {
        case "CANCEL#CLICKED":
            aceUtils.dismissModal('5c55-fe40-bab89a-fba1-8b9ba388');
            break;
        case "HELPFUL_RESOURCES#CLICKED":
            trackUsage("Clicked Helpful Resources", {
                name : eventPayload?.item?.label
            });
            break;
        case "FAQ#EXPANDED":
            trackUsage("Opened FAQ", {
                name : eventPayload?.item?.heading
            });
            break;
        case "BREADCRUMBS_ITEM_CLICKED":
            api.emit("NAV_ITEM_SELECTED", {
                route: 'plugins',
            });
            break;
    }

    function publish() {
        aceUtils.setContext(blockcontext);
    }

}
