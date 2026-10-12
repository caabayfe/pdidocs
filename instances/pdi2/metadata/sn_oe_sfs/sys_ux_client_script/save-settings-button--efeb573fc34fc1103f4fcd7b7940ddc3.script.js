/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.collab_chat_settings.refresh();
    
    const csFormData = api.state.settings;
    if(!csFormData || !csFormData.sys_id) {
        return;
    }

    csFormData.fields.enabled.value = api.state.toggleValue;

    api.data.create_or_update_collab_chat_settings.execute({
        enable_emojis: csFormData.fields.enable_emojis,
        enable_teams: csFormData.fields.enable_teams,
        enabled: csFormData.fields.enabled,
        enable_participant_suggestions: csFormData.fields.enable_participant_suggestions,
        enable_legacy_support: csFormData.fields.enable_legacy_support
    });

    /*
     * Uncomment when more fields are added
    for(const key in csFormData.fields) {
        if(csFormData.fields.hasOwnProperty(key)) {
            fieldValues += "^" + key + "=" + (csFormData.fields[key].value || 'NULL');
        }
    }*/

    /* 
     * Uncomment if sys prop needs to be updated in the future
    var collabEnabled = api.state.sysProperties["com.glide.cs.collab.enabled"];
    api.data.update_settings.execute({
                    table: "sys_properties",
                    recordId: collabEnabled.sys_id,
                    templateFields: "value=" + api.state["com.glide.cs.collab.enabled"],
                    useSetDisplayValue: null
    });
    */
    
    api.emit('SCREEN_STATUS_CHANGED', { isDirty : false });
}
