/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //when input is changed on keyup
    if(event.payload.fieldValue.length > 0){
        const currentNode = api.state.currentNode;
        const nodeKey = currentNode.key;
        const diagram = api.state.diagram;
        const node = diagram.findNodeForKey(nodeKey);
        diagram.model.setDataProperty(node.data, "name", event.payload.fieldValue);
    }
}
