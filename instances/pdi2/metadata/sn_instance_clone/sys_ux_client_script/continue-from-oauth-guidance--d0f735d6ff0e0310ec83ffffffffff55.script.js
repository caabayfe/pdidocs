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
    api.emit('NAV_ITEM_SELECTED', {
        route: null,
        fields: null,
        params: null,
        redirect: null,
        passiveNavigation: null,
        title: null,
        multiInstField: null,
        targetRoute: null,
        external: {
            url: api.state.newTargetUrl + "/now/clone/ui/oauth-setup/" + api.state.encryptedSourceUrl
        },
        navigationOptions: null
    });
    helpers.timing.setTimeout(() => {
        helpers.modal.open("register_instance");
    }, 200);
}
