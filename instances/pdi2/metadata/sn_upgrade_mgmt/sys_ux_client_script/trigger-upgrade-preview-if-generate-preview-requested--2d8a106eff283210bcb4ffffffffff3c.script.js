/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const upgradePreviewNotRanAtleastOnce = api.state.previewingVersionSysId === null;
    const upgradePreviewIsNotRunning = api.state.upgradePreviewExecTrackerState !== '0' && api.state.upgradePreviewExecTrackerState !== '1';
    const upgradePreviewRequested = api.data.look_up_generate_preview_requested.result.generate_preview.value;

    if (upgradePreviewNotRanAtleastOnce || (upgradePreviewIsNotRunning && upgradePreviewRequested)) {
        api.data.trigger_upgrade_preview_1.refresh();
    }
}
