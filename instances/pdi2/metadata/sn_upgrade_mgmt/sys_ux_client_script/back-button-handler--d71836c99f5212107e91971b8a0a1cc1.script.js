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
    const timestamp = new Date().getTime();
    const {
        prevRoute,
        setupId,
        interactionId
    } = api.context.props;

    if (prevRoute !== 'execution-history' || !interactionId) {
        helpers.navigate.to('setup', {
            "sysId": setupId
        }, {
            "interactionId": interactionId,
            "customId": timestamp
        });
    } else {
        helpers.navigate.to(prevRoute, {
            'setupId': setupId
        }, {
            "customId": timestamp
        });
    }


}
