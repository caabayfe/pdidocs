/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        selectedEntity,
        entityUseCasesMap,
        projectDetails,
        projectPermissions: {
            promin_project_entity,
            promin_project,
        }
    } = api.state;

    if (projectDetails.readonly || !promin_project_entity.canCreate || !promin_project.canWrite) {
        return true;
    }

    if (!selectedEntity || !selectedEntity.table) {
        return false;
    }

    const selectedEntityId = selectedEntity._row_data.uniqueValue;

    if (!selectedEntityId in entityUseCasesMap) {
        return false;
    }

    const childTables = [...entityUseCasesMap[selectedEntityId].childTables];

    const matchingTable = childTables.find(ct => ct.name === api.item.value.name);

    if (!matchingTable) {
        return false;
    }

    return matchingTable.disabled;
}
