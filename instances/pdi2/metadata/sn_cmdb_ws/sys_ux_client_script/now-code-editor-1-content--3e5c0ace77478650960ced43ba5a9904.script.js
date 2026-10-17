/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
        return JSON.stringify({
            edges: api.data.sandboxController.mapDataOut.edges,
            hiddenEdges: api.data.sandboxController.mapDataOut.hiddenEdges,
            hiddenNodes: api.data.sandboxController.mapDataOut.hiddenNodes,
            homeNode: api.data.sandboxController.mapDataOut.homeNode,
            nodes: api.data.sandboxController.mapDataOut.nodes
        }, null, 4);
    }
