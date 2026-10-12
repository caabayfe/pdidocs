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

    api.setState('uploadedFilePayload', null);
    api.setState('displayState', 'init');
    switch (event.elementId) {
        case 'cancel_button':
            api.emit('CI_MENU_ITEM_ACTION', { 'action': 'cancel' });
            break;
        case 'apply_button':
            api.data.ci_upload_menu_item_icon_1.execute({
                'sys_id': api.context.props.formPayload.id,
                'icon': api.state.uploadedFilePayload.value,
                'revert_to_default': false
            });
            break;
        default:
            return;
    }
}
