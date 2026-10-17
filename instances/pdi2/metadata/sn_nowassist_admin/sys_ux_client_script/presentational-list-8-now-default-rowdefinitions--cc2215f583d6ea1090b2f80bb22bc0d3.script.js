/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const rows = [];
    const failedAgentAndWorkflows = api?.state?.failedDiabledAgentAndWorkflows || [];

    if (!Array.isArray(failedAgentAndWorkflows) || failedAgentAndWorkflows.length === 0) return { rows };

    for (const agent of failedAgentAndWorkflows) {
        rows.push(constructRow(agent));
    }

    return { rows };

    // --- Helpers ---

    function constructRow(item) {
      
       

        return {
            key: `${Math.random().toString(36).substring(2)}`,
            cells: {
              
                name: {
                    value: item.name,
                    label: item.name,
                    id: item.name
                },
                description: {
                    value: item.name,
                    label: item.name,
                    id: item.name
                },
                type: {
                    value: item.type,
                    label: item.type,
                    id: item.type
                },
                currentProvider: {
                    value: item.currentProvider,
                    label: item.currentProvider,
                    id: item.currentProvider
                },
                error: {
                    value: item.actionStatus,
                    label: item.actionStatus,
                    id: item.actionStatus
                }
            }
        };
    }


}
