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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    switch (event.name) {
        case "NOW_APPOINTMENT_CALENDAR#SCHEDULE_APPOINTMENT":
            helpers.modal.close("calendar_modal");
            var selectedTime = event.payload.event.start;
            eventHandler.callUtilAPI({
                operation: "CHECK_SLOT_AVAILABILITY",
                sourceInstanceId: api.state.sourceInstanceId == "currentInstance" ? "" : api.state.sourceInstanceId,
                targetInstanceId: api.state.targetInstanceId,
                requestedTime: selectedTime
            }, false);
            break;

        case "NOW_APPOINTMENT_CALENDAR#RANGE_UPDATED":
            var utcTime = new Date(event.payload.startMoment._d.getTime() + event.payload.startMoment._d.getTimezoneOffset() * 60000);
            eventHandler.getCalendarConflictEntries(utcTime);
            break;

        default:
            break;
    }
}
