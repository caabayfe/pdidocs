/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let applicationData = api.context.props.applicationDetails;
    if (!applicationData)
        return true;

    // If the app is installed/uninstalled and there is a valid landing page URL, 
    // then install card should be visible else should be hidden.
    // Also, install button will transform into 'Get started' button 
    // if the above condition matches thus should be always visible even for updates.
    // applicationData.showInstallCard abstract the logic as described.
    if (applicationData.showInstallCard)
        return false;

    return true;
}
