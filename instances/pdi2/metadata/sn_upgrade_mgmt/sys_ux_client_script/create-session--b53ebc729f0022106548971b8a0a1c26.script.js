/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        if(api.data.check_if_session_in_progress.results?.length === 0) {
            api.data.upgrade_session_record_created.execute({
                table: "sn_um_upgrade_sessions",
                templateFields: `current_patch_id=${api.state.currentVersionZip}^current_patch_label=${api.state.currentVersion}^status=in_progress^target_patch_id=${api?.state?.selectedVersion?.id?.replace(".war", ".zip")}^target_patch_label=${api?.state?.selectedVersion?.label}^environment=${api.state.isProd ? "production" : "sub_production"}`
            });
        } else {
            api.data.get_upgrade_details_overview_page.refresh();
        }
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Create session", e);
    }
}
