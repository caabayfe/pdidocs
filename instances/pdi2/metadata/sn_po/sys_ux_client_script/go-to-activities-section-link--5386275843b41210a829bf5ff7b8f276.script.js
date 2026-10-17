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
    const entityId = api.state.selectedEntity._row_data.uniqueValue;
    const entityCardRepeaterData = [...api.state.entityCardRepeaterData];
    const childEntityIds = findEntityIdsWithParent(entityId, entityCardRepeaterData);
    api.setState('selectedEntityCardId', [entityId, ...childEntityIds]);

    let currentView = { ...api.state.currentView
    };
    currentView = {
        view: api.state.VIEWS.ACTIVITIES_LIST,
        params: {
            mode: '',
        },
    };
    api.setState('activitiesListSelectedRecords', []);
    api.setState('currentView', currentView);
    api.data.get_project_entities.refresh();

    const contentTreeItems = [...api.state.contentTreeItems];
    const parentIds = getParentIds(entityId, contentTreeItems.slice(1));
    const contentTreeSelectedIds = [...parentIds, entityId, `${entityId}-activities`];
    api.setState('selectedContentTreeItem', contentTreeSelectedIds);

    function getParentIds(nodeId, tree) {
        const parentIds = [];

        function findParents(node, targetId, parents) {
            if (node.id === targetId) {
                parentIds.push(...parents);
            } else if (node.children) {
                for (const childNode of node.children) {
                    findParents(childNode, targetId, [...parents, node.id]);
                }
            }
        }

        for (const node of tree) {
            findParents(node, nodeId, []);
        }

        return parentIds;
    }

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
