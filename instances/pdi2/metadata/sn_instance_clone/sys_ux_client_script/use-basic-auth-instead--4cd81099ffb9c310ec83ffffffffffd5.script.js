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
    api.setState("showErrorMessage", false);
    api.setState("showMsg", false);
    let modelParams = {
        "instance_name": api.state.translations.addNewCloneInstanceMsg,
        "instance_url": api.state.newTargetUrl,
        "admin_user": "",
        "admin_password": "",
        "show_warning": true,
        "modal_type": "create"
    };
    api.setState('modelParams', modelParams);
    helpers.modal.open('list_modal');
    helpers.modal.close('register_instance');
}
