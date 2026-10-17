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
    var config = {
        "hasConflict": {
            "icon": "triangle-exclamation-outline",
            "color": "critical",
            "label": await helpers.translate("Conflicts detected")
        },
        "noConflict": {
            "icon": "check-outline",
            "color": "positive",
            "label": await helpers.translate("No conflicts detected")
        }
    };
    const sowRemediateServerPlaybookConfig = imports['sn_sow_inc.SowRemediateServerPlaybookConfig']();
    var conflictCheckTimeout = sowRemediateServerPlaybookConfig.getConflictCheckTimeout();
    api.setState("conflictCheckTimeout", conflictCheckTimeout);
    api.setState("highlightedValueConfig", config);
}
