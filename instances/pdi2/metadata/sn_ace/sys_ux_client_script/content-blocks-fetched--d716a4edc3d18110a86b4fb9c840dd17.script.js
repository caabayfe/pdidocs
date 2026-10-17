/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {output} = api.data.ace_fetch_content_blocks;
    if (output && output.length) {
        api.setState('pageContentBlockData', [output[1]]);
        api.setState('contentBlockModalData', output[2].children);
    }
}
