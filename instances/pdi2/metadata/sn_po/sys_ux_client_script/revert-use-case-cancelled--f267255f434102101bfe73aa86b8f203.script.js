/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.state.currentUseCase || api.state.useCaseAction !== 'KEEP') {
        return;
    }
    const { selectedEntity, entityUseCasesMap, currentUseCase } = api.state;
    if (!selectedEntity || !selectedEntity.table) {
        return;
    }
    const selectedEntityId = selectedEntity._row_data.uniqueValue;
    if (!selectedEntityId in entityUseCasesMap) {
        return;
    }

    const entityUseCasesMapCopy = { ...entityUseCasesMap };

    if (api.state.useCaseAction === 'KEEP') {
        if (currentUseCase.startsWith('createChildTable')) {
            const [,childTableName,] = currentUseCase.split(':');
            const foundIndex = entityUseCasesMapCopy[selectedEntityId].childTables.findIndex(ct => ct.name === childTableName);
            if (foundIndex === -1) {
                return;
            }
            entityUseCasesMapCopy[selectedEntityId].childTables[foundIndex].value = true;
            entityUseCasesMapCopy[selectedEntityId].childTables[foundIndex].disabled = false;
        } else {
            entityUseCasesMapCopy[selectedEntityId][currentUseCase].value = true;
            entityUseCasesMapCopy[selectedEntityId][currentUseCase].disabled = false;
        }
    }

    api.setState('entityUseCasesMap', entityUseCasesMapCopy);
}
