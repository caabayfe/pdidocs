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

    const micClient = imports["global.MICClient"](api, helpers);

    function navToNHIAccountsPage() {
        navigateToMetricsPage('mi-account-list');
    }

    function navToUniqueApiCallsPage(authType) {
        navigateToMetricsPage('unique-api-calls', authType);
    }

    function navToPrivilegedUserpage() {
        navigateToMetricsPage('high-privilege-accounts');
    }

    function navigateToMetricsPage(page, query) {
        helpers.navigate.to('metrics', {
            page: page
        }, {
            query: query
        });
    }

    function pageReadyHandler() {
        let appEnabled = micClient.isApplicationEnabled();
        api.setState("appEnabled", appEnabled);

        if (!appEnabled)
            return;

        let client = micClient.newMIDataBroker('machine_identity_data_broker');
        client.exec("getIntegrationAccountCount", null);
        client.exec("getHighPrivilegedUserCount", null);
    }

    function openMIFeatureFlag() {
        micClient.navigateToExternal("/sys_properties.do?sys_id=8ef43f24934b5210edf8869e44891819");
    }

    function setDataVisDataSource() {
        let output = event.payload.data.output;
        let action = output.action;
        let count = output.response;
        let dataVisProps = getDataVisDataSourceProps(count);

        if (action == "getIntegrationAccountCount")
            api.setState("integrationAccount", dataVisProps);

        if (action == "getHighPrivilegedUserCount")
            api.setState("highPrivilegedAcount", dataVisProps);
    }

    function getDataVisDataSourceProps(count) {
        let dataVisProps = {
            "data": [{
            "value": count
        }],
            "metadata": {
                "format": {
                    "customFormat": true,
                    "decimalPrecision": 2,
                    "rounding": "HALF_UP",
                    "thousandSeparatorEnabled": true,
                    "abbreviationEnabled": true,
                    "numberInTooltipsEnabled": true
                }
            }
        };

        return [dataVisProps];
    }

    const fnMap = {
        'nhiCountWidget': navToNHIAccountsPage,
        'apiCallScoreWidget': () => navToUniqueApiCallsPage("all"),
        'privilegedUsesrWidget': navToPrivilegedUserpage,
        'authTypeDonut': () => navToUniqueApiCallsPage(event.payload.data.elements[0]),
        'MACROPONENT_READY': pageReadyHandler,
        'empty_state': openMIFeatureFlag,
        'machine_identity_data_broker': setDataVisDataSource
    };
    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();
}
