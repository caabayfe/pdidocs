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
    switch (event.name) {
        case 'SN_FORM_DATA_CONNECTED#FIELD_VALUE_CHANGED':
            if (event.payload.fieldName != 'icon') return;

            if (!event.payload.value) {
                //TODO: When file is deleted load default icon

                api.setState('displayState', 'file_upload_ready');
                return;
            }
            //When a new file is uploaded
            api.setState('uploadedFilePayload', event.payload);
            api.setState('displayState', 'file_uploaded');

            //Emit the action to parent to display alert and update webclient ui states
            api.emit('CI_MENU_ITEM_ACTION', { 'action': {
                'name': 'file_attached',
                'icon_image': event.payload.value,
                'icon_name': api.context.props.formPayload.highlight_icon
            } });
            break;
        default: return;
    }
}
