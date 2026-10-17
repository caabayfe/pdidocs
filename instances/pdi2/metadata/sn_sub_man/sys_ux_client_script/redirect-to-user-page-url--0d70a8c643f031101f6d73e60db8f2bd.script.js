/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //script to redirect to sys_user record page
    const table = 'sys_user';
    const sys_id = event.payload.sys_id;
    const url = "/now/nav/ui/classic/params/target/" + table + ".do" + encodeURIComponent("?sys_id=" + sys_id);
    api.emit('CUSTOM_REDIRECT_URL', {url: url});
}
