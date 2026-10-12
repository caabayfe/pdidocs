/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const fields = api.state.fields;
    const requiredFields = api.state.requiredFields;
    let emptyFields = "";
    let emptyFieldsLabel = [];

    const canSubmitForm = () => {
        //Check all mandatory & visible are populated
        let value = false;
        emptyFields = requiredFields.filter((fieldName) => fields[fieldName] && fields[fieldName]['mandatory'] && fields[fieldName]['visible'] && !fields[fieldName]['value']);
        if (emptyFields.length) {
            value = true;
        }
        for (let i = 0; i < emptyFields.length; i++) {
            emptyFieldsLabel.push(fields[emptyFields[i]].label);
        }
        return !value;
    };

    if (!canSubmitForm()) {
        let errorMessage = await helpers.translate("The following mandatory fields are not filled in: {0}", emptyFieldsLabel.join(", "));
        api.setState('errorMessage', errorMessage);
        api.setState('hideErrorMessage', false);
        return;
    }

    if (api.context.props.isGFormSave == "true") {
        for (var i = 0; i < requiredFields.length; i++) {
            if (fields[requiredFields[i]] && fields[requiredFields[i]].visible) {
                api.emit("GFORM#SET_VALUE", {fieldName: fields[requiredFields[i]].name, value: fields[requiredFields[i]].value});
            }
        }
        if (api.context.props.setFieldOnSave) {
            for (const prop in api.context.props.setFieldOnSave) {
                api.emit("GFORM#SET_VALUE", {fieldName: prop, value: api.context.props.setFieldOnSave[prop]});
            }
        }
        api.emit("GFORM#CLEAR_MESSAGES");
        api.emit("GFORM#SAVE");
        helpers.modal.close();
    } else {
        var obj = {};
        for (var i = 0; i < requiredFields.length; i++) {
            if (fields[requiredFields[i]] && fields[requiredFields[i]].visible) {
                obj[fields[requiredFields[i]].name] = fields[requiredFields[i]].value ? fields[requiredFields[i]].value: "";
            }
        }
        if (api.context.props.setFieldOnSave) {
            for (const prop in api.context.props.setFieldOnSave) {
                obj[prop] = api.context.props.setFieldOnSave[prop];
            }
        }
        api.data.update_incident.execute({
            table: api.context.props.table,
            sys_id: api.context.props.sysId,
            data: JSON.stringify(obj)
        });
    }
}
