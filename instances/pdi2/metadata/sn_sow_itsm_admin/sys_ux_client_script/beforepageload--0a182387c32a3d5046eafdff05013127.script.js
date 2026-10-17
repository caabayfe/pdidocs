/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let blockcontext = api.state.blockcontext;
    //update blockcontext as per your business logic.
    blockcontext.showEmptyState = true;
    blockcontext.showList = false;
    blockcontext.showActivateAlert = false;
    blockcontext.showDeactivateAlert = false;
    blockcontext.showDeleteAlert = false;
    blockcontext.showCreateOrEditAlert = false;
    blockcontext.showCopyAlert = false;
    if (api.context.props && api.context.props.hasOwnProperty('alert')) {
        if (api.context.props.alert == "edit" || api.context.props.alert == "new") {
            blockcontext.showCreateOrEditAlert = true;
        }
    }
    api.emit('ACE_PAGE_READY', {blockcontext});
}
