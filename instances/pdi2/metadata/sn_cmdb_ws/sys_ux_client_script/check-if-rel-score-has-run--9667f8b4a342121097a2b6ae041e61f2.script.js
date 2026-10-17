/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var result = api.data.get_rel_score.output.result;

    var showRelScores = false;

    for (var i = 0; i < result.length; i++) {
        var metric = result[i];

        if (metric.status != "not_run") {
            showRelScores = true;
            api.data.cmdb_health__cmdb_health_rest_api.refresh();
            break;
        }
    }

    api.setState("showScoreWidgets", showRelScores);
}
