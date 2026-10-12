/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try{
        api.setState("loading", false);
        if (!api.data.check_if_playbook_present.result.sys_pd_context_id.value) {
            if (api.state.totalLookups < 300) {
                helpers.timing.setTimeout(function() {
                        api.data.check_if_playbook_present.refresh();
                        api.setState("totalLookups", api.state.totalLookups + 1);
                }, 2000);
            }
        } else {
            api.setState("loading", true);
            helpers.timing.setTimeout(function() {
                api.data.upgrade_management___update_playbook_activity_state_1.refresh();
                api.setState("loading", false);
            }, 5000);
                
        }
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Poll for Context ID", e);
    }
}
