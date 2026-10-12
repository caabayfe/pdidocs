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
    const slaBreachEntityPayload = JSON.stringify({
        project: api.context.props.projectId,
        parent_entity: api.state.selectedEntity._row_data.uniqueValue,
        table: api.state.selectedEntity.table.value,
        sourceType: api.state.selectedEntity.source_type.value,
    });

    api.data.create_sla_breach_entity.execute({
        slaBreachEntityPayload,
    });
}
