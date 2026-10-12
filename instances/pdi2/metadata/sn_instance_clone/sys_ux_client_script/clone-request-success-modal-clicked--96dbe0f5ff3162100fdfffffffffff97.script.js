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
    helpers.modal.close('success_modal');
    navigateToPage({
        route: 'clone-status',
        fields: {
            'sysId': api.state.createdCloneRequestId,
            't': Date.now()
        }
    });

    function navigateToPage(navPayload) {
        api.emit("NAV_ITEM_SELECTED", {
            ...navPayload,
            reload: false
        });
    }
}
