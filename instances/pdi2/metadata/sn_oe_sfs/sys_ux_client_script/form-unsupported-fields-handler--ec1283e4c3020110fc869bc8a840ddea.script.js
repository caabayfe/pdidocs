/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    /**
     * Only script to maintain all event handlers to support Form fields,
     * which are not supported by OOB UIB Forms
     */
    function _getFormFieldValue(field) {
        try {
            //check if gform is available
            if (api.data.gform && api.data.gform.nowRecordFormBlob)
                return api.data.gform.nowRecordFormBlob.gForm.getValue(field);

            //if not use event payload
            if (event.name == 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS') {
                const recordValues = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.recordValues;
                for (var i = 0; i < recordValues.length; i++) {
                    if (recordValues[i].name == field) return recordValues[i].value;
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }
    try {
        let gFormData;
        const customFields = api.data.ci_record_slushbucket.output;
        switch (event.name) {
            //Handle page load visibility
            case 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS':
            case 'DATA_FETCH_SUCCEEDED':
                let fieldType, fieldsData, formValue, hideOnLoadCustomFields = {};
                for (fieldType in customFields) {
                    hideOnLoadCustomFields[fieldType] = false;
                    if (customFields[fieldType].field_dependent) {
                        fieldsData = customFields[fieldType].field_dependent.split('=');
                        formValue = _getFormFieldValue(fieldsData[0]);
                        if (formValue != fieldsData[1])
                            hideOnLoadCustomFields[fieldType] = true;
                    }
                }
                api.setState('hideOnLoadCustomFields', hideOnLoadCustomFields);
                break;
                //slushbucket selection support
            case 'NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET':
                gFormData = api.data.gform.nowRecordFormBlob.gForm;
                const selectedValues = event.payload.value;
                let parsedvalues = [];
                selectedValues.forEach((selectedValue) =>
                    parsedvalues.push(selectedValue.id)
                );
                gFormData.setValue(customFields.slushbucket.field_name, parsedvalues.toString());
                break;

                //script field update support
            case 'NOW_CODE_EDITOR#CONTENT_CHANGED':
                gFormData = api.data.gform.nowRecordFormBlob.gForm;
                const updatedSript = event.payload.text;
                gFormData.setValue(customFields.script.field_name, updatedSript);
                break;
            case 'SN_FORM_DATA_CONNECTED#FIELD_VALUE_CHANGED':
                const {
                    fieldName,
                    value
                } = event.payload;
                let customFieldsDisplay = api.state.hideOnLoadCustomFields;
                for (const f in customFields) {
                    if (customFields[f].field_dependent) {
                        const splittedValue = customFields[f].field_dependent.split('=');
                        if (splittedValue[0] == fieldName) {
                            customFieldsDisplay[f] = splittedValue[1] != value;
                        }
                    }
                }
                api.setState('hideOnLoadCustomFields', { ...customFieldsDisplay });
                break;

        }
    } catch (e) {

    }
}
