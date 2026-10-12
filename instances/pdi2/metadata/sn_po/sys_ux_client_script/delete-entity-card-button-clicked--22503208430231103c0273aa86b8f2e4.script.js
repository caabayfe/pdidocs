/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const entityId = event.context.item.value.entityId;
    const entityCardRepeaterData = [...api.state.entityCardRepeaterData];
    const childEntityIds = findEntityIdsWithParent(entityId, entityCardRepeaterData);
    api.setState('selectedEntityCardId', [entityId, ...childEntityIds]);
    
    function findEntityIdsWithParent(inputEntityId, data) {
        const matchingEntityIds = [];
        function findChildren(entityId) {
            for (const item of data) {
                if (item.parentId === entityId) {
                    matchingEntityIds.push(item.entityId);
                    findChildren(item.entityId); // Recursively search for children
                }
            }
        }
        findChildren(inputEntityId); // Start the recursive search
        return matchingEntityIds;
    }
}
