/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var pageParams = api.state.pageParams;
	pageParams.readOnly = true;
    api.setState("pageParams", pageParams);
    api.data.ace_fetch_content_blocks.refresh(); //can't figure out how to update props passed in ACE
}
