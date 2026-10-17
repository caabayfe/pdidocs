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
    const {
        id,
        default_icon
    } = api.context.props.payload;
    api.data.ci_upload_menu_item_icon.execute({
        'sys_id': id,
        'icon': default_icon,
        'revert_to_default': true
    });
}
