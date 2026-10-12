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
    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();
    const debounceThreshold = sowIncidentOverview.getImpactDBDebounceThreshold();
    if (event.elementId === "affected_ci_record_watcher" || event.elementId === "impacted_ci_record_watcher") {
        api.setState('impactRefreshDebounceTimeoutId', ({
            currentValue
        }) => {
            let timeoutId = currentValue || null;
            if (timeoutId) {
                helpers.timing.clearTimeout(timeoutId);
            }
            timeoutId = helpers.timing.setTimeout(() => {
                api.setState('impactRefreshDebounceTimeoutId', null);
                api.data.get_aggregate_counts.refresh();

            }, debounceThreshold);
            return timeoutId;
        });
    }
}
