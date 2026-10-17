/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var plugin_inactive_subheading = await helpers.translate("View the details about your active sessions and login history.");
    var plugin_active_subheading = await helpers.translate("View the details about your active sessions, login history, and registered mobile devices.");
    var operatingSystemLabel = await helpers.translate("Operating System");
    var deviceIdLabel = await helpers.translate("Device ID");
    var registeredTimeLabel = await helpers.translate("Registration Time");
    var statusLabel = await helpers.translate("Status");
    var activeValue = await helpers.translate("Active");
    var inactiveValue = await helpers.translate("Inactive");
    var profileLabel = await helpers.translate("Profile");
    var identityCenterLabel = await helpers.translate("Identity Center");
    
    api.setState("translations", {
        "identity_center_subheading": {
            "plugin_active": plugin_active_subheading,
            "plugin_inactive": plugin_inactive_subheading
        },
        "device_card": {
            "os_label": operatingSystemLabel,
            "device_id_label": deviceIdLabel,
            "reg_time_label": registeredTimeLabel,
            "status_label": statusLabel,
            "active_value": activeValue,
            "inactive_value": inactiveValue
        },
        "breadcrumbs": {
            "profile": profileLabel,
            "identity_center": identityCenterLabel
        }
    });
}
