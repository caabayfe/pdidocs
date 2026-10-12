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
    const payload = event.payload;
    const sysId = payload.sysId;
    if (!sysId) return;
    const upcomingSlotData = JSON.parse(JSON.stringify(api.state.upcomingSlotData));
    for (const index in upcomingSlotData) {
        const data = upcomingSlotData[index].data;
        if (data.sysId === sysId) {
            data.timer.isIncremental = true;
            data.timer.color = "critical";
            data.timer.fieldName = "Past due";
            data.type.value = "Overdue";
            data.type.show = true;
        }
    }
    api.setState("upcomingSlotData", upcomingSlotData);
}
