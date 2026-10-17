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
    let resultJson = JSON.parse(event?.payload?.data?.output);

    // stop if an error occurs within the API
    if (!resultJson?.pass) {
        api.setState("debugLogErrorMsg", resultJson.errorMessage);
        return;
    }

    let conditionalParams = {};
    const viewType = api?.state?.selectedRuleType;

    if (viewType == "gen_ai_agent" || viewType == "gen_ai_workflow") {
        conditionalParams = {
            "viewType": viewType
        };
    }

    // navigate to AI agent or AI workflow results page
    api.setState("debugLogErrorMsg", null);
    api.emit('NAV_ITEM_SELECTED', {
        route: "results",
        fields: {
            // grab the unique access analyzer request id from the response
            requestId: resultJson.resultId
        },
        params: conditionalParams
    });
}
