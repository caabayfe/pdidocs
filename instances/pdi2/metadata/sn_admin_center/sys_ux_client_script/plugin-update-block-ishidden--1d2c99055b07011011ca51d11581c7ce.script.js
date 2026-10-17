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

    //update plugin should be enabled only for app.
    if (applicationData.isPlugin)
        return true;

    //hide the update button if its not installed
    if (applicationData.isInstalledAndUpdateAvailable)
        return false;

    return true;
}
