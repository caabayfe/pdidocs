/**
 * Handles the event based on the parameters provided.
 * @param {object} params - The parameters object.
 * @param {object} params.api - The API object.
 * @param {object} params.event - The event object.
 * @param {object} params.imports - The imports object.
 * @param {object} params.helpers - The helper functions object.
 */
function handler({ api, event, helpers, imports }) {
    const { payload = {} } = event;
    const { dataSourceType, indicatorSysid } = payload.params || {};

    const navItemSelected = (sysid) => {
        const url = `now/platform-analytics-workspace/ac_kpi_details/${sysid}/params/list-view/-1`;
        api.emit("NAV_ITEM_SELECTED", { external: { url } });
    };

    if (dataSourceType === "indicator" && indicatorSysid ) {
        navItemSelected(indicatorSysid);
    }
}
