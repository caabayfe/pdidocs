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
    //This script gets the user record sys id from Unallocated User Reco data resource and redirects to user's record page
    const userSysId = api.data.unallocated_user_reco_query.result.user_allocation_data._reference.user._reference.sys_id.displayValue; 
    const table = 'sys_user';
    // navigate to sys_user record page for this user  
    const url = "/now/nav/ui/classic/params/target/" + table + ".do" + encodeURIComponent("?sys_id=" + userSysId);
        api.emit('CUSTOM_REDIRECT_URL', {
            url: url
        });
    
   

}
