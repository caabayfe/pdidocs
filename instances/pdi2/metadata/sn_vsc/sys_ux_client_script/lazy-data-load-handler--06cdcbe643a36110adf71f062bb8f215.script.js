/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const lazyLoadedBlock = event.payload.data.output;
    if (!lazyLoadedBlock || !lazyLoadedBlock.block_id)
        return;
    
    const { patchLazyBlock } = imports["sn_ace.ACELazyBlocksUtil"]();
    api.setState("contentBlocks", ({ currentValue, api }) => {
        let contentBlocks = [...currentValue] || [];
        patchLazyBlock(contentBlocks, lazyLoadedBlock);
        return JSON.parse(JSON.stringify(contentBlocks));
    });
}
