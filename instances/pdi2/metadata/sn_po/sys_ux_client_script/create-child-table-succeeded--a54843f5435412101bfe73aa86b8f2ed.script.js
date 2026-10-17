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
        success,
        errorMessages,
        infoMessages,
        entityId,
    } = event.payload.data.output.data.snPo.GlidePromin.createChildTable;
    if (!success) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'child-tables-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: errorMessages[0],
                action: {
                    type: 'dismiss'
                },
            }],
        });
        api.setState('entityId', api.state.selectedEntity._row_data.uniqueValue);
        return;
    }

    if (infoMessages && infoMessages.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'child-tables-info',
                status: 'positive',
                icon: 'info-circle-outline',
                content: infoMessages[0],
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }

    if (success) {
        api.setState('entityId', entityId);
    }

    api.setState('entityId', entityId);

    api.data.get_project_entities.refresh();
}
