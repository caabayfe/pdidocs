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
    let eventCustomName = '';
    let blockcontext = await aceUtils.getContext();
    
    switch (eventName) {
        case "SERVICE_GROUP_SELECTED":
            blockcontext.selectedServiceGroup = eventPayload.value;
            setLoader();
            await aceUtils.setContext(blockcontext);
            await aceUtils.refreshContentBlock('fetch_capability_success_data');
            setLoader(false);
            break;
    }

    function navigateToPage(navPayload, reload = false) {
        api.emit("NAV_ITEM_SELECTED", {
            reload: reload,
            ...navPayload
        });
    }

    function setLoader(loader = true) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: loader,
            label: "Loading",
            action: null,
            nonBlocking: false
        });
    }
}
