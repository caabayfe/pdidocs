/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.data.get_benchmarks_optin_status_1.output) {
        api.emit(("MACROPONENT_TRACK_USAGE_REQUESTED"), {
                event: "Benchmark dashboard views",
                value: {}
        });
    }
}
