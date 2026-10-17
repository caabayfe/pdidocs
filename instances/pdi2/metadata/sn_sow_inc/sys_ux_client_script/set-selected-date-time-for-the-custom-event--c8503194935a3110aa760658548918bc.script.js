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
    const {
        getNowDateTime,
        getFormattedDateText
    } =
    imports["sn_sow.SOWDateTimeHelper"]();
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const inputDateTime = event.payload.value;
    let customEventValid = JSON.parse(JSON.stringify(api.state.customEventValid));
    const userFormat = api.context.session.user.dateFormat + " " + api.context.session.user.timeFormat;
    let nowDateTimeObj = NowDateTime(inputDateTime, userFormat).format('YYYY-MM-DD HH:mm:ss') + '';
    if (nowDateTimeObj === "Invalid Date") {
        customEventValid.isDateTimeValid = false;
        api.setState("customEventValid", customEventValid);
        return;
    } else {
        customEventValid.isDateTimeValid = true;
        api.setState("customEventValid", customEventValid);
    }
    let customEvent = api.state.customEvent;
    const userDateTimeFormat = api.context.session.user.dateFormat.toUpperCase() + " " + api.context.session.user.timeFormat;
    customEvent.formattedDateTime = NowDateTime(inputDateTime).format(userDateTimeFormat);
    const nowDateTime = getNowDateTime(inputDateTime, api.context.session.user.dateTimeFormat, api.context.session.user.timeZone);
    customEvent.timestamp = getFormattedDateText(nowDateTime, "UTC", "YYYY-MM-DD HH:mm:ss");
    api.setState("customEvent", JSON.parse(JSON.stringify(customEvent)));
}
