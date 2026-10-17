/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    helpers.timing.setTimeout(async () => {
        try {
            const resource = await helpers.snHttp('/api/sn_admin_center/adminx/landing_page_instance_upgrade_data', {
                method: 'GET',
                batch: false
            });
            const {
                currentReleaseVersion,
                endOfLife,
                scheduledVersion,
                scheduledOn
            } = resource.response.result;
            api.setState('currentReleaseVersion', currentReleaseVersion);
            api.setState('endOfLife', endOfLife);
            api.setState('scheduledVersion', scheduledVersion);
            api.setState('scheduledOn', scheduledOn);
            api.setState('isInstanceUpgradeAPIProcessed', true);
        } catch ({
            error
        }) {
            console.error(error);
        }
    }, 3000);
}
