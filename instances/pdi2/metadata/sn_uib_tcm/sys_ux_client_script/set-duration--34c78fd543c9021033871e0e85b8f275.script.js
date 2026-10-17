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
    const initialTime = api.context.props.time;
    if (!initialTime) return;
    let intervalId = api.state.intervalId;
    if (intervalId) helpers.timing.clearInterval(intervalId);
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    const setDuration = async () => {
        let duration = new Date().valueOf() - initialTime;
        let durationStr = await playBookCommunicationCardUtil.convertDurationIntoTime(helpers, duration);;
        api.setState("duration", durationStr);
    };
    setDuration();
    intervalId = helpers.timing.setInterval(setDuration, 30000);
    api.setState("intervalId", intervalId);
}
