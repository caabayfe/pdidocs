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
    if (!api.context.props.totalDuration)
        return;

    const cabUtils = imports['sn_mtg_cab.CABUtils']();
    const utils = new cabUtils();

    const { duration, totalDuration, state, timesUp, paused } = api.context.props;

    const intervalId = api.state.intervalId;
    if (intervalId){
        helpers.timing.clearInterval(intervalId);
        api.setState('intervalId', null);
    }

    let details = {};
    if (api.context.props.state === 'active') {
        let currentDuration = duration;
        const newIntervalId = helpers.timing.setInterval(() => {
            currentDuration = currentDuration - 1000;
            details = utils.getCurrentValue(
                currentDuration,
                totalDuration,
                state,
                timesUp,
                paused
            );
            api.setState('timerDetails', details);
            if (details.diff <= 0)
                api.emit('STOP_CAB_TIMER', {});
        }, 1000);
        api.setState('intervalId', newIntervalId);
    }
}
