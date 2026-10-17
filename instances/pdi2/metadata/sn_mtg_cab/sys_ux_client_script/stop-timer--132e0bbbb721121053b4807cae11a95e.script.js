/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.intervalId){
        helpers.timing.clearInterval(api.state.intervalId);
        api.setState('intervalId', null);
    }

    const cabUtils = imports['sn_mtg_cab.CABUtils']();
    const utils = new cabUtils();
    const { totalDuration, state, timesUp, paused } = api.context.props;
    const details = utils.getCurrentValue(
        api.state.timerDetails.diff,
        totalDuration,
        state,
        timesUp,
        paused
    );
    api.setState('timerDetails', details);
}
