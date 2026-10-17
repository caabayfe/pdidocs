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
    var availableDate = api.data.get_all_score_dates_1.output;
    var date = availableDate[0].split(" ")[0];
    const dateUtil = imports['sn_vsc.SCDateUtils']();
    var dateDefaultFormat = dateUtil.userToDefaultFormat(date, api.context.session.user.dateFormat);
    api.setState("defaultSecondDate", date);
    api.setState("date2Selected", date);
    api.setState("date2Applied", dateDefaultFormat);
    api.setState("date2AppliedDisplay", date);
}
