/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.delete_entities.execute({
        table: 'promin_project_entity',
        query: 'sys_idIN' + api.state.selectedEntityCardId.join(','),
    });

    if (!Array.isArray(api.state.selectedEntityCardId) || api.state.selectedEntityCardId.length === 0) {
        return;
    }
    
    // Get parent node ID of the entity being deleted so that it can be expanded
    // in the content tree

    // `selectedEntityCardId` is an list of entity to be deleted and its child entities
    // We only need to calculate the parent node ID of the main entity being deleted
    // i.e. 0th index
    const deletedEntityId = api.state.selectedEntityCardId[0];

    const contentTreeItems = [...api.state.contentTreeItems];
    const parentId = findParent(contentTreeItems[1], deletedEntityId);

    api.setState('entityId', parentId);

     function findParent(tree, nodeId) {
        let parent = '';

        function traverse(node) {
            if (!node || !node.children) return;

            for (let child of node.children) {
                if (child.id === nodeId) {
                    parent = node.id;
                    return;
                }
                traverse(child);
            }
        }

        traverse(tree);

        return parent;
    }
}
