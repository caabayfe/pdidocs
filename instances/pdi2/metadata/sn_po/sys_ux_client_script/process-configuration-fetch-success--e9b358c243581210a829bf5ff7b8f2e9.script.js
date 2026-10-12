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
        touchPointsStatus,
        selectedEntity,
        projectTouchPointsEnabled,
        projectIdleTimeEnabled,
        projectDetails
    } = api.state;
    if (event.payload.data.output.data.GlidePromin_Query.configuration.process == null) {
        api.setState('classificationFields', []);
        api.setState('processId', null);
        // make configuration touch points empty
        api.setState('touchPoints', {});
        // update status value
        if (projectTouchPointsEnabled) {
            api.setState('touchPointsStatus', { ...touchPointsStatus,"newIncomingFields":[],"status":true });
        }
        // make status value
        if (projectIdleTimeEnabled) {
            api.setState('idleTimeConfiguration', { "fields":[],"isIdleTimeConfigValid":false,"newIncomingFields":[], "status":true});
        }
        return;
    }
    const {
        breakdownConfig: {classificationFields,
        importanceField},
        id,
        touchPoints,
        idleTime
    } = event.payload.data.output.data.GlidePromin_Query.configuration.process;
    api.setState('processId',id);
    const fields = new Set();
    classificationFields.forEach(field => fields.add(field));
    if (importanceField) {
        fields.add(importanceField);
    }
    const recommendedFields = [...fields].map(field => ({
        field,
        'selected': false
    }));

    const filteredRecommendations = recommendedFields.filter(item => !api.state.entityBreakdowns.includes(item.field));
    api.setState('classificationFields', filteredRecommendations);
    api.data.getfieldslabel.execute({
        table: api.state.selectedEntity.table.value,
        fields: filteredRecommendations.map(item => item.field)
    });

    if (!selectedEntity.parent_entity.value) {
        api.data.get_touch_points_status_1.execute({
            projectId: projectDetails._row_data.uniqueValue,
            processId: id,
        });
        api.data.get_idle_time_configuration_1.execute({
            entityId: selectedEntity._row_data.uniqueValue,
            processId: id,
        });
    }
    api.setState('touchPoints', touchPoints);
    api.setState('processConfigIdleTime', idleTime);
}
