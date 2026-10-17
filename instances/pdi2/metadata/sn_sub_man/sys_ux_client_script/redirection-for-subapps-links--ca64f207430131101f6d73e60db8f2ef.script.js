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
    const table = event.payload.table;
    switch (table) {
        case 'sn_entitlement_st_subscription_application_family':
            const appId = event.payload.sys_id;
            const sysId = api.context.props.sysId;
            helpers.navigate.to('user-access', {
                appId,
                sysId
            });
            break;
        case 'license_family':
            const table = event.payload.table;
            const sys_id = event.payload.sys_id;
            const url = "/now/nav/ui/classic/params/target/" + table + ".do" + encodeURIComponent("?sys_id=" + sys_id);
            api.emit('CUSTOM_REDIRECT_URL', {url: url});
            break;
    }



}
