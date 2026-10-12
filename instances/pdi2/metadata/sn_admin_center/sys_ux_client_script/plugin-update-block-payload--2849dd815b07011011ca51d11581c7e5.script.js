/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var applicationData = api.context.props.applicationDetails;
    if (!applicationData || applicationData.isPlugin)
        return {};

    //update flow is only associated with the application
    let appPluginInfo = {};
    let id = applicationData.applicationId;
    let type = 'application';
    appPluginInfo[id] = type;
    let appName = helpers.translateSync(applicationData.appName);
    // no need to pass post action button url or name as this component 
    // should be hidden after update. 
    return {
        type: {
            route: 'plugin-update-card'
        },
        props_details: {
            action: 'update',
            button_label: 'Update',
            post_action_label: '',
            plugin_home_url: '',
            variant: 'primary',
            plugins: JSON.stringify(appPluginInfo),
            configure_demo_data: true,
            plugin_name: appName,
            app_scope: applicationData.appScope,
            variant: 'secondary'
        },
    };
}
