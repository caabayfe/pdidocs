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
    api.setState("isOpenWrapUpForCurrentUser", false);

    if (api.state.timer) {
        helpers.timing.clearInterval(api.state.timer);
    }

    api.setState("timer", null);
    api.setState("timerLabel", "");
    api.setState("isWrapUpSubmitted", true);
}
