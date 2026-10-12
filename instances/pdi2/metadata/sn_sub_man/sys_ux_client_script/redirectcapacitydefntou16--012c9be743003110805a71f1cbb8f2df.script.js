/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    const table = 'ua_defn_base';
    const sys_id = api.data.sub_ent_record.result.quota_defn.value;
    const url = "/now/nav/ui/classic/params/target/" + table + ".do" + encodeURIComponent("?sys_id=" + sys_id);
    // navigating to plaform
    api.emit('CUSTOM_REDIRECT_URL', {url: url});
}
