/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let blockcontext = api.state.blockcontext;
    api.state.stagedContentBlocks.forEach((block) => {
        let block_data = block;
        switch (block.elementId) {
            case 'styleable_container_1':
                blockcontext.groupItems = block_data.props_details.groupItems;
                blockcontext.groupSelectedItems = block_data.props_details.groupSelectedItems;
                blockcontext.groupItemsLoaded = block_data.props_details.groupSelectedItems;

                blockcontext.userItems = block_data.props_details.userItems;
                blockcontext.userSelectedItems = block_data.props_details.userSelectedItems;
                blockcontext.userItemsLoaded = block_data.props_details.userSelectedItems;
                break;
            default:
        }
    });
    blockcontext.showAlert = false;
    api.emit('ACE_PAGE_READY', {blockcontext});
}
