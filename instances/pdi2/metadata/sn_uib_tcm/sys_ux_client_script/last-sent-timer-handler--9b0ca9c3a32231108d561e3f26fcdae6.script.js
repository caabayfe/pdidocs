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
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    if (api.state.intervalId)
        helpers.timing.clearInterval(api.state.intervalId);
    const lastSent = api.context.props.commTaskDetails.last_sent;
 
    const getLastSent = async () => {
        const timeZone = api.context.session.user.timeZone;
        let duration = NowDateTime().tz("UTC").valueOf() - playBookCommunicationCardUtil.getNowDateTime(NowDateTime,api.context.props.commTaskDetails.last_sent, null, timeZone, "UTC").valueOf();
        let lastSent = await playBookCommunicationCardUtil.convertDurationIntoTime(helpers,duration);
        api.setState("lastSent", lastSent);
    };
    if (lastSent) {
        const intervalId = helpers.timing.setInterval(getLastSent, 30000);
        api.setState("intervalId", intervalId);
    } else helpers.timing.clearInterval(api.state.intervalId);
}
