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
    api.setState("contentBlocks", contentBlocks);

    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    aceUtils.addDataBlockOutputMappingToContext(contentBlocks, blockContext);

    const { getLazyBlockIds } = imports["sn_ace.ACELazyBlocksUtil"]();
    const _lazyBlockIds = getLazyBlockIds(contentBlocks);
    _lazyBlockIds.forEach(blockId => {
        api.data.lazy_load.execute({
            blockId: blockId,
            pageParams: api.state.pageParams
        });
    });
}
