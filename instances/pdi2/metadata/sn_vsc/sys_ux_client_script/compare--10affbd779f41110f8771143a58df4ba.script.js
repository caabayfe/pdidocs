/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function compare({
    api,
    event,
    helpers,
    imports
}) {
    const dateUtil = imports['sn_vsc.SCDateUtils']();
    const userFormat = api?.context?.session?.user?.dateFormat;
    let startDate = api.state.date1Selected,
        endDate = api.state.date2Selected;
    let startDateFormatted = dateUtil.userToDefaultFormat(startDate, userFormat);
    let endDateFormatted = dateUtil.userToDefaultFormat(endDate, userFormat);
    /* Set dates */
    api.setState('date1Applied', startDateFormatted);
    api.setState('date2Applied', endDateFormatted);
    api.setState('date1AppliedDisplay', startDate);
    api.setState('date2AppliedDisplay', endDate);
    const res = api.data.vsc_compare_scans.refresh({
        "start_date": startDateFormatted,
        "end_date": endDateFormatted
    });
}
