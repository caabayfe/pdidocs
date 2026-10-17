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
        infoMessages,
        entityId,
    } = event.payload.data.output.data.snPo.GlidePromin.includeApprovalAnalysis;
    if (!success) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'include-approvals-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
        api.setState('entityId', api.state.selectedEntity._row_data.uniqueValue);
        const entityUseCasesMapCopy = { ...api.state.entityUseCasesMap };
        const selectedEntity = api.state.selectedEntity._row_data.uniqueValue;
        entityUseCasesMapCopy[selectedEntity].includeApprovals.value = false;
        entityUseCasesMapCopy[selectedEntity].includeApprovals.disabled = false;
        api.setState('entityUseCasesMap', entityUseCasesMapCopy);
        return;
    }

    if (success) {
        api.setState('entityId', entityId);
    }

    api.setState('entityId', entityId);

    infoMessages.forEach(function(message, i) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: `include-approvals-info-${i}`,
                status: 'info',
                icon: 'circle-check-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
    });

    if (message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'include-approvals-success',
                status: 'positive',
                icon: 'circle-check-outline',
                content: message,
                action: {
                    type: 'dismiss'
                },
            }],
        });
    }

    api.data.get_project_entities.refresh();
}
