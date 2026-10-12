/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const fieldsMap = api.data.record.form.fields;
    const filteredFields = {};

    for (const fieldName in fieldsMap) {
        const fieldData = fieldsMap[fieldName];
        const fieldType = fieldData.dictionary? fieldData.dictionary.type: fieldData.type;

        if (fieldType == 'html' || fieldType == 'translated_html' || fieldType == 'wiki_text' || fieldType == 'markdown') {
            filteredFields[fieldName] = fieldData;
        }
    }

    return filteredFields;
}
