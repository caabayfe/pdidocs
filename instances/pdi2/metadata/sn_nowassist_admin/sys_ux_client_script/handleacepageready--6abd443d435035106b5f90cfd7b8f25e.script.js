/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let blockContext = event.payload.blockcontext;
    let contentBlocks = event.payload.contentBlocks || api.state.stagedContentBlocks;
    // api.setState("blockcontext", blockContext);
    api.setState("contentBlocks", contentBlocks);

    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    aceUtils.addDataBlockOutputMappingToContext(contentBlocks, blockContext);

    
}
