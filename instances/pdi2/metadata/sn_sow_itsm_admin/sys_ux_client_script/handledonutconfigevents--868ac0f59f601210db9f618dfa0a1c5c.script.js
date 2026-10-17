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
    var blockcontext = await aceUtils.getContext();

    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    let navigationUrl;
    if (eventName == "tier1-donut-config-click") {
        navigationUrl = blockcontext.tier1NavigationUrl;
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: navigationUrl
            }
        })
    } else if (eventName == "tier2-donut-config-click") {
        navigationUrl = blockcontext.tier2NavigationUrl;
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: navigationUrl
            }
        })
    }

}
