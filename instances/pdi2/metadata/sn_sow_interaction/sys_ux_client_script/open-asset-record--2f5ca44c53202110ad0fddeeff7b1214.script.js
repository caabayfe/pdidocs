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
    helpers.navigate.to('record', {
        'table': 'alm_asset',
        'sysId': event.context.item.value.sysId
    }, {}, false, false, 'current');
}
