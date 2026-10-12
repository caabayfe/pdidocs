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
    const frames = [...api.state.historyFrames, api.state.currentFrame];
    api.setState('historyFrames', frames);
    api.setState('currentFrame', 'playbookViewer');
    
}
