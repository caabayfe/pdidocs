/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const BACKSLASH = "/";
    const DOT_DO = ".do";
    const QUERY_SEPARATOR = "?";
    const SYS_ID_PARAMETER = "sys_id=";

    var table = event.payload.table;
    var sys_id = event.payload.sys_id;

    var path = BACKSLASH + table + DOT_DO;
    var query = QUERY_SEPARATOR + SYS_ID_PARAMETER + sys_id;

    var url = path + query;

    /** 
    * This emits the REFERENCE_LINK_REDIRECT event and passes the desired url in the payload object.
    * 
    * To view the REFERENCE_LINK_REDIRECT event definition, go to: 
    * Body (Flex) component -> Page configurations -> Events -> Handled events -> REFERENCE_LINK_REDIRECT
    */
    api.emit('REFERENCE_LINK_REDIRECT', {url: url});
}
