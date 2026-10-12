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

    // Not to call app Client API incase hide entitled widget propert is set as true
    let shouldNotCallAppClient = false;
    try {
        const resource = await helpers.snHttp('/api/sn_admin_center/adminx/getHideEntitledWidgetFlag', {
            method: 'GET',
            batch: false
        });
        const {
            shouldHideWidget,
        } = resource.response.result;
        api.setState('hideEntitledWidget', shouldHideWidget);
        shouldNotCallAppClient = shouldHideWidget === 'true';
    } catch ({
        error
    }) {
        console.error(error);
    }

    if (shouldNotCallAppClient)
        return;

    helpers.timing.setTimeout(async () => {
        try {
            const appsInstalledResource = await helpers.snHttp('/api/sn_appclient/appmanager/apps?tab_context=installed', {
                method: 'POST',
                batch: false
            });
            let appsInstalledResult = appsInstalledResource.response.result;
            let appsInstalled = appsInstalledResult.apps && appsInstalledResult.apps.length > 0 ? appsInstalledResult.apps.length : 0;

            const appsUpdateResource = await helpers.snHttp('/api/sn_appclient/appmanager/apps?tab_context=updates', {
                method: 'POST',
                batch: false
            });
            let appsUpdateResult = appsUpdateResource.response.result;
            let appsNeedUpdate = appsUpdateResult.apps && appsUpdateResult.apps.length > 0 ? appsUpdateResult.apps.length : 0;

            const appsAvailableResource = await helpers.snHttp('/api/sn_appclient/appmanager/apps?tab_context=available_for_you', {
                method: 'POST',
                batch: false
            });

            let appsAvailableResult = appsAvailableResource.response.result;
            let totalApps = appsAvailableResult.apps && appsAvailableResult.apps.length > 0 ? appsAvailableResult.apps.length : 0;

            api.setState('appsInstalled', appsInstalled + '');
            api.setState('appsNeedUpdate', appsNeedUpdate + '');
            api.setState('totalApps', totalApps + '');
        } catch ({
            error
        }) {
            console.error(error);
        }
    }, 1000);

}
