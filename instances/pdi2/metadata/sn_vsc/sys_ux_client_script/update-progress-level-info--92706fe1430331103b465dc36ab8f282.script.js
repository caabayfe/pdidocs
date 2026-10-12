/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.sc_get_best_practices_progress_level_information && api.data.sc_get_best_practices_progress_level_information.output) {
        api.setState("isNew", api.data.sc_get_best_practices_progress_level_information.output.isNew);
        api.setState("shouldHideAllCompletedView", api.data.sc_get_best_practices_progress_level_information.output.allCompleted);
        api.setState("most_recentlyUpdated_bpName", api.data.sc_get_best_practices_progress_level_information.output.most_recentlyUpdated_bpName);
        api.setState("stepsRemainingForRecentlyUpdatedBestPractice", api.data.sc_get_best_practices_progress_level_information.output.stepsRemaining);
        api.setState("buttonText", api.data.sc_get_best_practices_progress_level_information.output.buttonText);
        api.setState("most_recentlyUpdated_bpSysId", api.data.sc_get_best_practices_progress_level_information.output.most_recentlyUpdated_bpSysId);
    }
}
