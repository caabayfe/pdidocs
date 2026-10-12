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
    var patternId = api.context.props.patternId;
    if (patternId == -1)
        helpers.navigate.to('deflection-configuration', {
            'deflectionconfigurationId': api.context.props.configId

        }, {"timestamp": Date.now()});
}
