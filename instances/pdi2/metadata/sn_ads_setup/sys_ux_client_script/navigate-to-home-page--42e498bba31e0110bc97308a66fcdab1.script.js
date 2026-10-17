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
    const { prevRoute, sysId} = api.context.props;
    if (prevRoute == 'execution-history') {
        helpers.navigate.to(prevRoute, {
            'setupId': sysId
        },{
            "customId": timestamp
        });
    } else {
        helpers.navigate.to("home", {}, {
            "customId": timestamp
        });
    }
}
