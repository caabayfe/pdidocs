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
    const url = '/now/nav/ui/classic/params/target/sys_user_has_role_list.do%3Fsysparm_query%3Drole.name%253Dsn_admin_center.read_only';
    api.emit('NAV_ITEM_SELECTED', {
        external: {
            url
        }
    });

}
