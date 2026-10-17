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
    helpers.snHttp(
            '/api/sn_appclient/v1/appmanager/get_page_config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        ).then(({
            response
        }) => {
            api.setState('lastSyncTime', response?.result?.appsLastSyncTime || "");
        })
        .catch(error => {
            console.error("Error creating schedule:", error);
        });
}
