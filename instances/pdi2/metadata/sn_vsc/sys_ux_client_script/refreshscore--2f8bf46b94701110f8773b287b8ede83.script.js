/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.data_visualization_api_for_vsc_score.refresh();
    api.data.sc_get_summary_score_details__1.refresh();
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
        "viewportElementId": "viewport_anb",
        "route": '/hardening-compliance-summary-card',
        "fields": null,
        "params": null
    });
}
