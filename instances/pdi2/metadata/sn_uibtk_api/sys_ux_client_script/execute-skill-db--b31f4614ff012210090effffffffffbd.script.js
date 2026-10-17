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
    api.setState('payload', event.payload);
    if (!api.state.executedOnce) {
        api.setState('executedOnce', true);
    } else {
        api.data.execute_skill_1.refresh();
    }
}
