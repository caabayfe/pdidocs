/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let reloadPage = api.state.refreshContentBlocks;
    api.setState('refreshContentBlocks', false);
    if (reloadPage){
        api.data.ace_fetch_content_blocks.refresh();
    }
}
