/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     helpers.timing.setTimeout(function() {
     const patchLabel = api?.context?.props?.experienceProperties?.target_patch_label?.value;
     const instanceID = api?.data?.get_instance_id_1?.output;
        if (!instanceID || !patchLabel) {
            console.error("Missing instance ID or patch label");
            return;
        }
    const hiUrl = api?.data?.get_support_url_1?.output;
            this.window.open(hiUrl + 
            "now/en/pages/automation-store" +
            "?catalog_sys_id=e81a774f4f0eea00927b60001310c7cb" +
            "&id=ns_automation_store" +
            "&instanceId=" + instanceID +
            "&versionName=" + encodeURIComponent(patchLabel.toLowerCase()));    
    });
}
