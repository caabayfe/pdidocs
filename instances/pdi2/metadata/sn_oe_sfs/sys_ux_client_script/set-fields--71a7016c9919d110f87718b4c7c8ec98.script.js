/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {nowRecordFormBlob} = api.data.gformfont;
    if (nowRecordFormBlob && nowRecordFormBlob.fields && nowRecordFormBlob.fields.category) {
        const fields = {...nowRecordFormBlob.fields};
        fields.category.visible = false;
        api.setState('fields', fields);
    }
}
