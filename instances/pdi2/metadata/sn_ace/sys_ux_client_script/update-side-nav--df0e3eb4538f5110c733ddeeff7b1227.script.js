/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let contentTree = [];
    const getUpdatedBlock = function(block, result) {
        let tempResult = {id: block.block_id, label: block.title || block.name, children: []};
        if(block.children && block.children.forEach) {            
            block.children.forEach((childBlock) => getUpdatedBlock(childBlock, tempResult.children));
        }
        result.push(tempResult);
    }
    if(event.payload.contentTree) {
        let eventPayload = event.payload.contentTree;
        if(eventPayload) {
            if(eventPayload.forEach) {
                eventPayload.forEach((block) => {
                    let updatedBlock = [];
                    getUpdatedBlock(block, updatedBlock);
                    contentTree = contentTree.concat(updatedBlock);
                });
            }else {
                let updatedBlock = [];
                getUpdatedBlock(eventPayload, updatedBlock);
                contentTree = contentTree.concat(updatedBlock);
            }
        }
    }
    api.setState("contentTree", contentTree);
}
