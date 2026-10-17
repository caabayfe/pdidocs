/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Avoid proceeding if there was an issue with saving the form
    if (event.name === "CTRL_RECORD#FORM_SUBMIT_COMPLETED" && event.payload.status !== "success") {
        api.setState('buttonId', '');
        return;
    }

    function getFormModel(record) {
        return {
            encodedRecord: record.encodedRecord,
            fields: record.form.fields,
            isNewRecord: record.isNew,
            isReadOnly: record.isReadOnly,
            sysId: record.sysId,
            table: record.table,
            view: record.view,
        };
    }

    /**
     * When this script is run from clicking a footer button, we reference the ID of the clicked button via 'event.elementId'. If the button should save, we save the ID in state and initiate a form save. If the form save was successful, we reference the saved ID via 'api.state.buttonId' and proceed with dispatching the click event along with conditionally closing the dialog.
     */
    switch (api.state.buttonId || event.elementId) {
        case "primary_button": {
            if (event.name === "NOW_BUTTON#CLICKED" && api.context.props.primaryButtonSave) {
                api.setState('buttonId', 'primary_button');
                api.data.modeless_record.saveForm();
            } else {
                api.setState('buttonId', '');
                api.emit('MODELESS_FORM#PRIMARY_BUTTON_CLICKED', getFormModel(api.data.modeless_record));
                if (api.context.props.primaryButtonClose) {
                    api.emit('UXF#CLOSE_DIALOG_REQUEST');
                }
            }
            break;
        }

        case "secondary_button": {
            if (event.name === "NOW_BUTTON#CLICKED" && api.context.props.secondaryButtonSave) {
                api.setState('buttonId', 'secondary_button');
                api.data.modeless_record.saveForm();
            } else {
                api.setState('buttonId', '');
                api.emit('MODELESS_FORM#SECONDARY_BUTTON_CLICKED', getFormModel(api.data.modeless_record));
                if (api.context.props.secondaryButtonClose) {
                    api.emit('UXF#CLOSE_DIALOG_REQUEST');
                }
            }
            break;
        }
    }
}
