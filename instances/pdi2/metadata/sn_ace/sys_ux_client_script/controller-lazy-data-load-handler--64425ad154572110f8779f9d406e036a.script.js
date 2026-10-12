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

    const lazyLoadedBlock = event.payload.data.output;

    if (lazyLoadedBlock && lazyLoadedBlock.block_id) {
        const {
            patchLazyBlock
        } = imports["sn_ace.ACELazyBlocksUtil"]();
        let contentBlocks = [...api.state.aceContentTree] || [];
        patchLazyBlock(contentBlocks, lazyLoadedBlock);
        contentBlocks = JSON.parse(JSON.stringify(contentBlocks));

        api.setState("aceContentTree", contentBlocks);

        api.emit('ACE_CONTROLLER_DATA_FETCH_SUCCEEDED', {
            eventName: 'ACE_CONTROLLER_DATA_FETCHED',
            eventPayload: {
                blockContext: api.state.aceBlockContext,
                contentTree: contentBlocks
            }
        });
    }


}
