/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        api.emit("UNIFIED_NAVIGATION#PAGE_TITLE_UPDATE_REQUESTED_RELAY_b1a99b06ff3312106548ffffffffff36", {
            label: `Guided upgrade | Upgrade Console${api?.state?.instanceNameGuided ? ` | ${api?.state?.instanceNameGuided}` : ""}`,
            bypassExperienceTitle: true
        });
    },5000);
}
