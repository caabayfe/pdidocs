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
    blockcontext.showAlert="false";
    blockcontext.showFirstTimeUser=true;
    blockcontext.showList=false;
    blockcontext.selectedTab="0";
    api.emit('ACE_PAGE_READY', {blockcontext});
}
