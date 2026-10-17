/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try{
        helpers.timing.setTimeout(() => {
            api.data.get_upgrade_details_overview_page.refresh();
            api.data.get_bulkapp_update_details_overview_page_1?.refresh();
        },2000);
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: refresh upgrade details", e);
    }
}
