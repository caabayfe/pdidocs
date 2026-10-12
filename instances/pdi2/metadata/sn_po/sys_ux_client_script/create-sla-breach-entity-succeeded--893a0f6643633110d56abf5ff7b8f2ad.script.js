/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        success,
        message,
        entityId
    } = event.payload.data.output.data.snPo.GlidePromin.createProminSlaBreachEntity;
    if (!message) {
        return;
    }

    api.setState('entityId', entityId);
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'sla-entity-creation-message',
            status: success == true ? 'positive' : 'critical',
            icon: success == true ? 'info-circle-outline' : 'exclamation-triangle-outline',
            content: message,
            action: {
                type: 'dismiss'
            },
        }],
    });
    if (api.state.projectDetails.state.value === 'AVAILABLE') {
        api.setState('currentTableDisplayName', 'promin_project_entity');
    }

    if (success) {
        api.setState('entityId', entityId);
    } else {
        api.setState('entityId', api.state.selectedEntity._row_data.uniqueValue);
    }
    
    api.data.get_project_entities.refresh();
}
