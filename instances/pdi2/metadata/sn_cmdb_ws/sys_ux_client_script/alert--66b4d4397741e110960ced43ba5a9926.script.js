/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports }) {
    debugger;
    var node = event.payload.node;
    var edge = event.payload.edge;
    var edges = event.payload.edges;
    var element;
    if (node) {
        element = 'node "' + event.payload.node.id + '"';
    } else if (edge) {
        element = 'edge ' + (event.payload.edge.id ? '"' + event.payload.edge.id + '"' : '"id undefined" (' + event.payload.edge.sourceId + ' --> ' + event.payload.edge.targetId + ')');
    } else if (edges) {
        element = 'edges "' + edges.map(e=>e.id).join(',') + '"';
    } else {
        element = 'element deselection';
    }

    var i = api.state.i;
    i++;
    api.setState('i', i);
    var id = "alert" + i;
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        "items": [{
            "id": id,
            "status": "info",
            "icon": "info-circle-outline",
            "content": element,
            "action": {
                "type": "dismiss"
            }
        }]
    });

    helpers.timing.setTimeout(() => {
        api.emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
            "items": [{
                "id": id
            }]
        });
    }, 3000);
}
