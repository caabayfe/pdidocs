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
    let appsInfo = [{
            'scopeName': 'sn_benchmarks',
            'appId': 'com.snc.sn_benchmarks',
            'appName': await helpers.translate('ServiceNow Benchmarks'),
            'appStatus': '',
            'actionName': '',
            'highlightedText': '',
            'highlightedTextColor': '',
            'licenseCheck': false,
            'installationCheck': false,
            'appManagerURL': '/now/app-manager/home/app/id/3214b661c3eb211062ebf69f05013160/details'
        },
        {
            'scopeName': 'sn_sd_itsm',
            'appId': 'com.snc.success_dashboard_itsm',
            'appName': await helpers.translate('ITSM Success Dashboard indicators'),
            'appStatus': '',
            'actionName': '',
            'highlightedText': '',
            'highlightedTextColor': '',
            'licenseCheck': false,
            'installationCheck': false,
            'appManagerURL': '/now/app-manager/home/app/id/1c351c91070130108b66068f0ad30010/details'
        },
        {
            'scopeName': 'sn_sd_hrsm',
            'appId': 'com.snc.success_dashboard_hrsm',
            'appName': await helpers.translate('HR Success Dashboard indicators'),
            'appStatus': '',
            'actionName': '',
            'highlightedText': '',
            'highlightedTextColor': '',
            'licenseCheck': false,
            'installationCheck': false,
            'appManagerURL': '/now/app-manager/home/app/id/e80b82cc7e745110d981e2ed614e2c7c/details'
        }
    ];
    let appsResponse = {},
        response;
    for (let appInfo of appsInfo) {
        try {
            appsResponse = await helpers.snHttp(
                '/api/sn_appclient/appmanager/apps?sysparm_limit=1&tab_context=installed&search_key=' + appInfo['scopeName'], {
                    method: "POST"
                }
            );
        } catch (e) {
            if (e.error.status == 403 && e.error.statusText == "Forbidden")
                appInfo['installationCheck'] = true;
        } finally {
            if (appsResponse.response)
                response = appsResponse.response.result.apps;
            if (response && isInstalled(response)) {
                if (hasUpdates(response)) {
                    appInfo['actionName'] = await helpers.translate('Update');
                    appInfo['appStatus'] = await helpers.translate('Plugin is installed. Plugin update is available.');
                } else {
                    appInfo['highlightedText'] = await helpers.translate('You are all set');
                    appInfo['highlightedTextColor'] = 'green';
                    appInfo['appStatus'] = await helpers.translate('Plugin is installed.');
                }
            } else {
                appInfo['appStatus'] = await helpers.translate('Install plugin to get started.');
                if (!appInfo['installationCheck'])
                    appInfo['actionName'] = await helpers.translate('Get Application');
                appInfo['licenseCheck'] = true;
            }
        }
    }
    api.setState('appStatus', await helpers.translate('Plugin is installed.'));
    api.setState('highlightedText', await helpers.translate('Check Subscription'));
    api.setState('appsInformation', appsInfo);

    function isInstalled(response) {
        return response.length > 0;
    }

    function hasUpdates(response) {
        return response[0].update_available != '0';
    }
}
