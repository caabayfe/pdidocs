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
    if (event.context.item.value.typeValue == 'microsoft_teams_chat')
        api.setState('interactionSysId', event.context.item.value.sysId);
    else
    helpers.navigate.to('record', {
        'table': 'interaction',
        'sysId': event.context.item.value.sysId
    }, {}, false, false, 'current');
}
