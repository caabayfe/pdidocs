/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let fields = {};
    if (api.data.glide_form_1.nowRecordFormBlob &&
        api.data.glide_form_1.nowRecordFormBlob.fields) {
        fields = api.data.glide_form_1.nowRecordFormBlob.fields;
        for (let fieldName in fields) {
            if (fields.hasOwnProperty(fieldName) &&
                fields[fieldName].hasOwnProperty('declarativeUiActions')) {
                fields[fieldName]['declarativeUiActions'] = [];
            }
        }
    }
    return fields;
}
