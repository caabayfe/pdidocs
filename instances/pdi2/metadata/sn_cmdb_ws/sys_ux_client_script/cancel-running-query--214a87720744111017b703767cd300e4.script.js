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
        cancelQueryError
    } = imports['sn_cmdb_ws.cmdbNlqSearchUtil']();
    const cancelError = await cancelQueryError(helpers);

    if (api.state.workerId && api.context.props.queryStatusId) {
        helpers.snHttp("/api/now/cmdbquerybuilder/queries/bg/cancel/" + api.state.workerId + "/" + api.context.props.queryStatusId, {
            method: "PUT",
            batch: false,
            body: {}
        }).then(response => {
            const status = response.result;
            _clearState();
            api.setState('listRefresh', {
                timestamp: new Date()
            });
        }).catch(error => {
            api.setState('showNlqSearchNotification', true);
            api.setState('nlqSearchNotificationContent', cancelError);
            console.error('Cancel query failed');
            _clearState();
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
        });
    }

    const _clearState = () => {
        api.setState('workerId', null);
        api.setState('isLoading', false);
        const isQueryLoadedPoller = api.state.isQueryLoadedPoller;
        if (isQueryLoadedPoller) {
            helpers.timing.clearInterval(isQueryLoadedPoller);
        }
    };
}
