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
    //redirect to Opt in page
    api.emit("NAV_ITEM_SELECTED", {
        "external": {
            "url": "now/success-dashboard-admin-console/benchmarks"
        }
    });

    api.emit(("MACROPONENT_TRACK_USAGE_REQUESTED"), {
        event: "Benchmark opt-ins from dashboard",
        value: {}
    });
}
