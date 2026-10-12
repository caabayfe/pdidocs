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
    let blockContext = api.state.aceBlockContext;
    let contentBlocks = event.payload.data.output;
    api.setState("aceContentTree", contentBlocks);
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    let updatedBlockContext = aceUtils.addDataBlockOutputMappingToContext(contentBlocks, blockContext, "v3");
    let newBlockContext = { ...blockContext,
        ...updatedBlockContext
    };
    api.setState("aceBlockContext", newBlockContext);

    const {
        getLazyBlockIds
    } = imports["sn_ace.ACELazyBlocksUtil"]();
    const _lazyBlockIds = getLazyBlockIds(contentBlocks);

    api.emit('ACE_CONTROLLER_DATA_FETCH_SUCCEEDED', {
        eventName: 'ACE_CONTROLLER_DATA_FETCHED',
        eventPayload: {
            blockContext: newBlockContext,
            contentTree: contentBlocks
        }
    });

    _lazyBlockIds.forEach(blockId => {
        api.data.lazy_load.execute({
            blockId: blockId,
            pageParams: api.state.pageParams
        });
    });
}
