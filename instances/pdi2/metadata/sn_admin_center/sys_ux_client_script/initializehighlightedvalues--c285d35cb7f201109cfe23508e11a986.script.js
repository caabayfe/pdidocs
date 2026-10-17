/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getApplicationInstallationHighlightedValue,
        getApplicationLicensingHighlightedValue
    } = imports['sn_admin_center.AdminCenterCommonUtils']();

    const {
        status,
        licensing
    } = api.context.props.payload;

    var installationStatusHighlightedValue = getApplicationInstallationHighlightedValue(status);
    var licensingStatusHighlightedValue = getApplicationLicensingHighlightedValue(licensing);
    const installationStatusLabel = await helpers.translate(installationStatusHighlightedValue.label);
    const licensingStatusLabel = await helpers.translate(licensingStatusHighlightedValue.label);
    installationStatusHighlightedValue.label = installationStatusLabel;
    licensingStatusHighlightedValue.label = licensingStatusLabel;
    api.setState('installationStatusHighlightedValue', installationStatusHighlightedValue);
    api.setState('licenseStatusHighlightedValue', licensingStatusHighlightedValue);
}
