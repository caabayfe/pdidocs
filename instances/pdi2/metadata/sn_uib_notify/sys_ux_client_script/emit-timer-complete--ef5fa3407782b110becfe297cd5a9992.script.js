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
    /**
     * Emit Upcoming card timer complete event
     */
    const elementContext = event.context.item.value;
    const data = elementContext.data || {};
    api.emit("NOTIFY_UPCOMING_SLOT_TIMER_COMPLETE", {
        sysId: data.sysId || ""
    });
}
