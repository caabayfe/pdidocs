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
    const {
        convertTimezone,
        getFormattedDateStringForMoveEventModal
    } = imports['global.TimeZoneUtil']();

    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();

    const {
        newStartDate,
        newEndDate,
        timeZone,
        isSeries
    } = api.context.props;
    if (isSeries) api.setState('selectedId', 'all_occurrences');
    var bodyText = await getFormattedDateStringForMoveEventModal(api, helpers, newStartDate, newEndDate, timeZone);
    api.setState("heading_text", await helpers.translate("Confirm event reschedule"));
    api.setState("body_text", bodyText);
}
