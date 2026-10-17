/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const colorFieldGroups = api.data.ci_branding_settings_helper.output.color_fields_with_groups;
    const brandingSettings = api.data.ci_branding_settings_helper.output.branding_settings;
    api.setState('colorFieldGroups', colorFieldGroups);
    const { webClientBrandingSettings } = api.state;

    //IF Glideform resolves first
    if(Object.keys(webClientBrandingSettings).length != 0){
        api.setState('webClientBrandingSettings', {
            ...brandingSettings,
            ...webClientBrandingSettings
        });
    }else
        api.setState('webClientBrandingSettings', brandingSettings);
}
