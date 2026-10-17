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
    let blockcontext = api.state.blockcontext;
    /*api.state.stagedContentBlocks.forEach((block) => {
        let block_data = block;
        if (block.name == "Page Container") {
            blockcontext = block_data.props_details.cloneProfileData || {};
            blockcontext.preserversCount = block_data.props_details.preserversCount;
            blockcontext.exclusionsCount = block_data.props_details.exclusionsCount;
            blockcontext.cleanupScriptsCount = block_data.props_details.cleanupScriptsCount;
            blockcontext.showAdd = block_data.props_details.showAdd;
            blockcontext.showUpdate = block_data.props_details.showUpdate;
            blockcontext.showDelete = block_data.props_details.showDelete;
            blockcontext.showReset = block_data.props_details.showReset;
            blockcontext.showDefinitions = block_data.props_details.showDefinitions;
            blockcontext.targetInstances = block_data.props_details.targetInstances;
            blockcontext.disableComponents = block_data.props_details.disableComponents;
        }
    });
    */
    blockcontext.disableAddButton = true;
    //blockcontext.modalDeleteMessage = blockcontext.modalDeleteMessageText + blockcontext.name + "?";
    blockcontext.showErrorMessage = false;
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
    helpers.screen.updateStatus({
        title: blockcontext.header
    });
}
