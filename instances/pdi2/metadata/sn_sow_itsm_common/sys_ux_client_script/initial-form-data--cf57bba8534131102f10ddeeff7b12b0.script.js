/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const eventName = event.name;
    const translations = {
        "Resolve": await helpers.translate("Resolve"),
        "Fix":await helpers.translate("Fix"),
        "Assign": await helpers.translate("Assign"),
        "Save": await helpers.translate("Save"),
        "Submit": await helpers.translate("Submit"),
        "Cancel": await helpers.translate("Cancel"),
        "Accept Risk": await helpers.translate("Accept Risk"),
        "Mark Duplicate": await helpers.translate("Mark Duplicate"),
        "Assess":await helpers.translate("Assess")
     
    };

    const updateHeading = () => {
        const modalTitle = typeof api.context.props.modalTitle == "string" ? api.context.props.modalTitle : api.context.props.title;
        const heading = translations[modalTitle] || modalTitle;
        api.setState("heading", heading);
    };

    const updateButtonLabels = () => {
        let saveLabel = translations["Save"];
        let cancelLabel = translations["Cancel"];
        if (api.context.props.saveLabel) {
            saveLabel = translations[api.context.props.saveLabel] || api.context.props.saveLabel;
        }
        if (api.context.props.cancelLabel) {
            cancelLabel = translations[api.context.props.cancelLabel] || api.context.props.cancelLabel;
        }
        api.setState("saveLabel", saveLabel);
        api.setState("cancelLabel", cancelLabel);
    };

    const updateFormDataWithParentFormFields = () => {
        let parentFormFields = api.context.props.parentFormFields;
        let hideOptionalFields = api.context.props.hideOptionalFields;
        if (typeof parentFormFields == "string") {
            parentFormFields = JSON.parse(api.context.props.parentFormFields);
        }
        if (parentFormFields) {
            for (let fieldName in parentFormFields) {
                if (parentFormFields.hasOwnProperty(fieldName) && api.data.glide_form_1.nowRecordFormBlob &&
        api.data.glide_form_1.nowRecordFormBlob.fields && api.data.glide_form_1.nowRecordFormBlob.fields.hasOwnProperty(fieldName)) {
                    api.data.glide_form_1.nowRecordFormBlob.gForm.setValue(parentFormFields[fieldName].name, parentFormFields[fieldName].value);
                    if(hideOptionalFields && ((parentFormFields[fieldName].mandatory && parentFormFields[fieldName].value) || !parentFormFields[fieldName].mandatory)) {
                        api.data.glide_form_1.setVisible({fieldName: parentFormFields[fieldName].name, visibility: false});
                    }
                }
            }
        }
    };

    const updateFormDataWithSetFieldOnoad = () => {
        let setFieldOnLoad = api.context.props.setFieldOnLoad;
        if (typeof setFieldOnLoad == "string") {
            setFieldOnLoad = JSON.parse(api.context.props.setFieldOnLoad);
        }
        if (setFieldOnLoad) {
            for (let fieldName in setFieldOnLoad) {
                if (setFieldOnLoad.hasOwnProperty(fieldName) && api.data.glide_form_1.nowRecordFormBlob &&
        api.data.glide_form_1.nowRecordFormBlob.fields && api.data.glide_form_1.nowRecordFormBlob.fields.hasOwnProperty(fieldName)) {
                    api.data.glide_form_1.nowRecordFormBlob.gForm.setValue(fieldName, setFieldOnLoad[fieldName]);
                }
            }
        }
    };

    switch (eventName) {
        case 'MACROPONENT_READY':
            updateButtonLabels();
            updateHeading();
            break;
        case 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS':
            updateFormDataWithParentFormFields();
            updateFormDataWithSetFieldOnoad();
            api.setState('hideLoader', true);
            break;
    }
}
