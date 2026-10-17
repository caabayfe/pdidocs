/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    if (!api.data.ci_record_slushbucket.output || !api.data.ci_record_slushbucket.output.slushbucket || !api.data.gform || !api.data.gform.nowRecordFormBlob)
        return [];

    const items = api.data.ci_record_slushbucket.output.slushbucket.field_data_source;
    const fieldName = api.data.ci_record_slushbucket.output.slushbucket.field_name;
    if (!fieldName)
        return [];

    function _getFormFieldValue(field) {
        try {
            //check if gform is available
            return api.data.gform.nowRecordFormBlob.gForm.getValue(field);
            //Todo: if gform is not available, use event payload??
            // //
            // if (event.name == 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS') {
            //     const recordValues = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.recordValues;
            //     for (var i = 0; i < recordValues.length; i++) {
            //         if (recordValues[i].name == field) return recordValues[i].value;
            //     }
            // }
            return null;
        } catch (e) {
            return null;
        }
    }

    const fieldValues = _getFormFieldValue(fieldName);
    if (!fieldValues)
        return [];

    const selectedItems = fieldValues.split(",").map(function(value) {
        return items.find(function(item) {
            return item.id === value;
        });
    });
    return selectedItems;
}
