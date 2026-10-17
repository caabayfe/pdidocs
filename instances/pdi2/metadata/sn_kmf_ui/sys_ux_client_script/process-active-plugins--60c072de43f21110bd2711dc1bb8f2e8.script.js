/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var results = api.data.plugins.output;

    var state = [];
    for (var i = 0; i != results.length; ++i) {
        var result = results[i];
        if ("com.glide.sm.enterprise" == result["id"])
            api.setState("identities", result["active"]);
    }
}
