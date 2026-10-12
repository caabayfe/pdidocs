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

    if (api.state.workerId && api.state.queryStatusId) {
        const {
            cancelQueryError
        } = imports['sn_cmdb_ws.cmdbNlqSearchUtil']();
        const cancelError = await cancelQueryError(helpers);
        
        const {
            workerId,
            queryStatusId
        } = api.state;

        helpers.snHttp("/api/now/cmdbquerybuilder/queries/bg/cancel/" + workerId + "/" + queryStatusId, {
            method: "PUT",
            batch: false,
            body: {}
        }).then(response => {
            // On success this is a no-op. Loading state has already been cleared
        }).catch(error => {
            api.setState('showNlqSearchNotification', true);
            api.setState('nlqSearchNotificationContent', cancelError);
            const message = `Error: ${error.data ? error.data.error.message : error}`;
            console.error(message);
        });

        api.setState('workerId', null);
        api.setState('isLoading', false);
        api.setState('queryStatusId', null);
        const isQueryLoadedPoller = api.state.isQueryLoadedPoller;
        if (isQueryLoadedPoller) {
            helpers.timing.clearInterval(isQueryLoadedPoller);
        }
    }
}
