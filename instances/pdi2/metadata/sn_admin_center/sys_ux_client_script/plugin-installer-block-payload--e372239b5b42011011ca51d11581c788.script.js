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
    if (!applicationData)
        return {};

    let pluginDetails = {};
    let appPluginInfo = {};
    let id = applicationData.isPlugin ? applicationData.pluginId : applicationData.applicationId;
    let type = applicationData.isPlugin ? 'plugin' : 'application';
    appPluginInfo[id] = type;

    let appName = helpers.translateSync(applicationData.appName);
    // With new change, the details regarding plugin need to be passed separately
    if (applicationData.isPlugin) {
        pluginDetails[id] = {
            hasDemoData: applicationData.installationDetails.hasDemoData,
            name: appName
        };
    }

    const buttonLabel = applicationData.isPlugin ? helpers.translateSync('Activate') : helpers.translateSync('Install');
    return {
        type: {
            route: 'plugin-install-card'
        },
        props_details: {
            action: 'install',
            post_action_label: helpers.translateSync('Get started'),
            button_label: buttonLabel,
            plugin_home_url: applicationData.landingUrl,
            plugin_details: pluginDetails,
            variant: 'primary',
            plugins: JSON.stringify(appPluginInfo),
            configure_demo_data: true,
            plugin_name: appName,
            app_scope: applicationData.appScope,
            new_tab_config: true
        },
    };
}
