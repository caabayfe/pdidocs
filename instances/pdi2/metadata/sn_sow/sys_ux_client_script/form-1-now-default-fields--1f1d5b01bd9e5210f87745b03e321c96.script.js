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
    if (api.data.record.form && api.data.record.form.fields) {
        fields = api.data.record.form.fields;
        for (let fieldName in fields) {
            if (fields.hasOwnProperty(fieldName) &&
                fields[fieldName].hasOwnProperty('declarativeUiActions')) {
                fields[fieldName]['declarativeUiActions'] = [];
            }
        }
    }
    return fields;
}
