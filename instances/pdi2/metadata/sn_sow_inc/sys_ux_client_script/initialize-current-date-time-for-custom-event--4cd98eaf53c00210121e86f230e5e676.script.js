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
        getRelativeTimeAsync,
        getNowDateTime,
        getFormattedDateText
    } = imports['sn_sow.SOWDateTimeHelper']();
    const dateTimeFormat = api.context.session.user.dateFormat + " " + api.context.session.user.timeFormat;
    const UTCDateTime = getFormattedDateText(getNowDateTime(), "UTC", "YYYY-MM-DD HH:mm:ss");
    const formattedDateTimeText = getFormattedDateText(getNowDateTime(), api.context.session.user.timeZone , dateTimeFormat);
    let customEvent = {
        "message": "",
        "timestamp": UTCDateTime,
        "formattedDateTime": formattedDateTimeText,
    };
    api.setState("customEvent", customEvent);
}
