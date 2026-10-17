/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'advanced-condition-error',
            status: 'info',
            icon: 'circle-check-outline',
            content: await helpers.translate('Entity saved'),
            action: {
                type: 'dismiss'
            },
        }],
    });
    api.setState('selectedContentTreeItem', ['process-tables-view']);
    api.data.get_project_entities.refresh();
}
