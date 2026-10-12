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
        sysId,
        prevRoute
    } = api.context.props;

    let timestamp = new Date().getTime();
    if (prevRoute == 'execution-history') {
         helpers.navigate.to(prevRoute, {
            'setupId': sysId
        });
    } else {
    helpers.navigate.to("home", {
    }, {
        "customId": timestamp
    });
    }
}
