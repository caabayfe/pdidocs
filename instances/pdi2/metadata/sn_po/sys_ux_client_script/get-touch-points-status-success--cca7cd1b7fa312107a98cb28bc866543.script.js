/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const result = event.payload.data.output.data.snPo.GlidePromin.touchPointsStatus;
    if (result.success) {
        api.setState('touchPointsStatus', result);
    }
}
