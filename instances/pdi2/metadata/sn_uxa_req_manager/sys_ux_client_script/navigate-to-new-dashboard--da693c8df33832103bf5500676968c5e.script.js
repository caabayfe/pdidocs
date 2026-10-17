/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const title = await helpers.translate('New Dashboard');
    api.emit('NAV_ITEM_SELECTED', {
        route: 'dashboards',
        title: title,
        fields: {},
        params: {
            sysId: event.payload.routeSysId,
            edit: event.payload.editMode
        }
    });
}
