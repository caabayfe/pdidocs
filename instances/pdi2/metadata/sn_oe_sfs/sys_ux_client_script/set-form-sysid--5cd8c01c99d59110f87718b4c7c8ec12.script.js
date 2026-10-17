/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('loading', false);
    api.setState('sysId', api.data.gformfont.nowRecordFormBlob.config.sysId);
    api.data.gformfont.nowRecordFormBlob.gForm.setValue('category', 'font');
}
