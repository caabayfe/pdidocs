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
    if (api.state.isUpdateRecordInProgress) {
        return;
    }
    let fields = {};
    let hideOptionalFields = api.context.props.hideOptionalFields;
    if (api.data.glide_form_1.nowRecordFormBlob &&
        api.data.glide_form_1.nowRecordFormBlob.fields) {
        fields = api.data.glide_form_1.nowRecordFormBlob.fields;
    }
    let emptyMandatoryFields = [];
    let emptyMandatoryFieldsLabel = [];

    const canSubmitForm = () => {
        //Check if all visible mandatory fields are populated
        for (let fieldName in fields) {
            if (fields.hasOwnProperty(fieldName)) {
                if (fields[fieldName] &&
                    fields[fieldName]['visible'] &&
                    fields[fieldName]['mandatory'] &&
                    !fields[fieldName]['readonly'] &&
                    !fields[fieldName]['value']) {
                    emptyMandatoryFields.push(fieldName);
                }
            }
        }

        for (let i = 0; i < emptyMandatoryFields.length; i++) {
            emptyMandatoryFieldsLabel.push(fields[emptyMandatoryFields[i]].label);
        }

        return emptyMandatoryFields.length == 0;
    };

    if (!canSubmitForm()) {
        let errorMessage = await helpers.translate("The following mandatory fields are not filled in: {0}", emptyMandatoryFieldsLabel.join(", "));
        api.setState('errorMessage', {
            type: 'critical',
            icon: 'exclamation-triangle-outline',
            message: errorMessage
        });
        api.setState('hideErrorMessage', false);

        for (let i = 0; i < emptyMandatoryFields.length; i++) {
            api.data.glide_form_1.hideFieldMessage({
                fieldName: emptyMandatoryFields[i],
                clearAll: true
            });
            api.data.glide_form_1.showFieldMessage({
                fieldName: emptyMandatoryFields[i],
                message: await helpers.translate("{0} is required", emptyMandatoryFieldsLabel[i]),
                type: 'error'
            });
        }
        return;
    } else {
        api.setState('hideErrorMessage', true);
    }

    let setFieldOnSave = api.context.props.setFieldOnSave;
    setFieldOnSave = typeof setFieldOnSave == "string" ? JSON.parse(setFieldOnSave) : setFieldOnSave;

    if (api.context.props.isGFormSave == "true") {
        for (let fieldName in fields) {
            if (fields.hasOwnProperty(fieldName) && fields[fieldName].visible) {
                api.emit("GFORM#SET_VALUE", {
                    fieldName: fields[fieldName].name,
                    value: fields[fieldName].value
                });
            }
        }
        if (setFieldOnSave) {
            for (let prop in setFieldOnSave) {
                api.emit("GFORM#SET_VALUE", {
                    fieldName: prop,
                    value: setFieldOnSave[prop]
                });
            }
        }
        api.emit("GFORM#CLEAR_MESSAGES");
        api.emit("GFORM#SAVE");
        helpers.modal.close();
    } else {
        var obj = {};
        let parentFormFields = api.context.props.parentFormFields;
        if (typeof parentFormFields == "string") {
            parentFormFields = JSON.parse(api.context.props.parentFormFields);
        }
        for (let fieldName in fields) {
            let isParentFormFieldNotReadOnly = (!parentFormFields || (parentFormFields && (!parentFormFields[fieldName] || (parentFormFields[fieldName] && !parentFormFields[fieldName].readonly))));
            if (fields.hasOwnProperty(fieldName) && (hideOptionalFields && !fields[fieldName].readonly && isParentFormFieldNotReadOnly) || fields[fieldName].visible) {
                obj[fields[fieldName].name] = fields[fieldName].value ? fields[fieldName].value : "";
            }
        }
        if (setFieldOnSave) {
            for (let prop in setFieldOnSave) {
                obj[prop] = setFieldOnSave[prop];
            }
        }
        api.data.update_record_1.execute({
            table: api.context.props.table,
            sys_id: api.context.props.sysId,
            data: JSON.stringify(obj)
        });
        api.setState('isUpdateRecordInProgress', true);
    }
}
