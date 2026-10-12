/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    var sysId = event.payload.sys_id
             || (event.payload.fields && event.payload.fields.sys_id);

    if (sysId) {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/now/nav/ui/classic/params/target/sn_instance_clone_cleanup_script_execution.do'
                     + encodeURIComponent('?sys_id=' + sysId)
            }
        });
    }
}
