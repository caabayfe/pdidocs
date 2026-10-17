/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { entities } = event.payload.data.output.data.snPo.GlidePromin.getUseCasesState;

    if (!entities || entities.length === 0) {
        return;
    }

    api.setState('entityUseCasesMap', {});

    const entityUseCasesMap = {};

    for (const entity of entities) {
        if(entity){
        entityUseCasesMap[entity.id] = {
            includeApprovals: entity.includeApprovals,
            includeSLABreach: entity.includeSLABreach,
            childTables: entity.childTables,
        };
        }
    }

    api.setState('entityUseCasesMap', entityUseCasesMap);

    // Update use cases counts on content tree
    const contentTreeItems = [...api.state.contentTreeItems];
    const tree = contentTreeItems[1];

    for (const entity of entities) {
        if(entity){
        const payload = {
            useCasesCount: entity.includeApprovals.value + entity.includeSLABreach.value + (entity.childTables.some(ct => ct.value) ? 1 : 0),
            allHidden: !entity.includeApprovals.visible && !entity.includeSLABreach.visible && Boolean(entity.childTables.length === 0),
        };

        mutateNode(tree, entity.id, payload);
        }
    }

    api.setState('contentTreeItems', contentTreeItems);

    function mutateNode(tree, targetId, payload) {
        if (tree.sysId === targetId) {
            if (payload.allHidden) {
                // If all use cases are hidden, remove the Use cases item from content tree
                tree.children = tree.children.filter(item => item.id !== `${tree.sysId}-advanced-settings`);
            } else {
                for (let i = 0; i < tree.children.length; i += 1) {
                    if (tree.children[i].id === `${tree.sysId}-advanced-settings`) {
                        tree.children[i].statuses = [{
                            type: "badge",
                            value: payload.useCasesCount,
                            round: true,
                            status: 'low'
                        }];
                    }
                }
            }
        } else if (tree.children) {
            // Recursively search for the target node in children
            for (const child of tree.children) {
                mutateNode(child, targetId, payload);
            }
        }
    }
}
