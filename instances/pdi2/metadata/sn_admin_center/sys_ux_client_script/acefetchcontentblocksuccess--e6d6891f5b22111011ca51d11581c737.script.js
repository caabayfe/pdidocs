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
    let showDetailsContainer = api.state.showDetailsContainer;
    if (!showDetailsContainer) {
        api.setState('showDetailsContainer', true);
        const applicationId = api.context.props.applicationId;
        const {
            getApplicationLicensingHighlightedValue,
            getApplicationInstallationHighlightedValue
        } = imports['sn_admin_center.AdminCenterCommonUtils']();
        try {
            const resource = await helpers.snHttp(`/api/sn_admin_center/adminx/app_info/${applicationId}`, {
                method: 'GET',
                batch: false
            });
            const {
                licensing,
                estimatedCompletionTime,
                businessImpact,
                status,
                dateText
            } = resource.response.result;

            // License tag
            let applicationLicensingHighlightedValue = getApplicationLicensingHighlightedValue(licensing);
            const licensingLabel = await helpers.translate(applicationLicensingHighlightedValue.label);
            applicationLicensingHighlightedValue.label = licensingLabel;

            // Installation tag
            var installationStatusHighlightedValue = getApplicationInstallationHighlightedValue(status);
            const installationStatusLabel = await helpers.translate(installationStatusHighlightedValue.label);
            installationStatusHighlightedValue.label = installationStatusLabel;

            api.setState('licenseStatusHighlightedValue', applicationLicensingHighlightedValue);
            api.setState('estimatedCompletionTime', estimatedCompletionTime ? estimatedCompletionTime.toLocaleLowerCase() : null);
            api.setState('businessImpact', businessImpact ? businessImpact.toLocaleLowerCase() : null);
            api.setState('installationStatusHighlightedValue', installationStatusHighlightedValue);
            api.setState('dateText', dateText);
        } catch ({
            error
        }) {
            console.error(error);
        }
    }
}
