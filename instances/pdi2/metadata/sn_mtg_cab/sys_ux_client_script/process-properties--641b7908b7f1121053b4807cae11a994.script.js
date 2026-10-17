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
    const cabUtils = imports['sn_mtg_cab.CABUtils']();
    const utils = new cabUtils();

    const { duration, totalDuration, state, timesUp, paused } = api.context.props;
    
    if (api.state.intervalId)
        api.emit('STOP_CAB_TIMER', {});

    let currentDuration = api.state.timerDetails?.diff;
    if (
        !currentDuration ||
        (event.name === 'MACROPONENT_PROPERTY_CHANGED' && event.payload.name === 'duration')
    )
        currentDuration = duration;

    const details = utils.getCurrentValue(
        currentDuration,
        totalDuration,
        api.context.props.state,
        api.context.props.timesUp,
        api.context.props.paused
    );
    api.setState('timerDetails', details);

    if (state === 'active')
        api.emit('START_CAB_TIMER', {});
}
