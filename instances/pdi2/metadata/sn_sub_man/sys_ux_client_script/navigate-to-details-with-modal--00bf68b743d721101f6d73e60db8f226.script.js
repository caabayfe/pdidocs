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
    //need to use timestamp to create a unique property value on every navigation
    const currentTimestamp = Date.now();
    const params = {
        'showmod': 'true',
        'ts': currentTimestamp
    };
    const category = 'regularuser';
    const sysId = api.context.props.sysId;

    //navigate to details page with the allocate licenses modal being displayed
    helpers.navigate.to('subscription-details', {
        sysId,
        category
    }, params);
}
