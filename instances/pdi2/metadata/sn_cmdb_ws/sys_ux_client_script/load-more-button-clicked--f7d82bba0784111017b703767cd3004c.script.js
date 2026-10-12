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
        genericError,
        queryRunningWarning
    } = imports['sn_cmdb_ws.cmdbNlqSearchUtil']();
    const genericErrorMsg = await genericError(helpers);
    const queryRunningWarningMsg = await queryRunningWarning(helpers);

    const _clearState = () => {
        api.setState('workerId', null);
        api.setState('isLoading', false);
        const isQueryLoadedPoller = api.state.isQueryLoadedPoller;
        if (isQueryLoadedPoller) {
            helpers.timing.clearInterval(isQueryLoadedPoller);
        }
    };

    api.setState('isLoading', true);
    helpers.snHttp('/api/now/cmdbquerybuilder/queries/bg/' + api.context.props.queryStatusId + '/execute', {
            method: 'GET'
        })
        .then(({
            response
        }) => {
            if (!response || !response.result) {
                api.setState('showNlqSearchNotification', true);
                api.setState('nlqSearchNotificationContent', genericErrorMsg);
                console.error('Load more failed');
                _clearState();
                return;
            }
            if (response.result.status == 'FAILED') {
                if (response.result.worker_id == -1) {
                    console.warn('Load more failed - another query in progress');
                    api.setState('nlqSearchNotificationContent', queryRunningWarningMsg);
                } else {
                    console.error('Load more failed');
                    api.setState('nlqSearchNotificationContent', genericErrorMsg);
                }
                api.setState('showNlqSearchNotification', true);
                _clearState();
                return;
            }

            // query in progress, set the worker id for cancel action
            api.setState('workerId', response.result.worker_id);

            // get the current status of the query
            const isQueryLoadedPoller = helpers.timing.setInterval(() => {
                helpers.snHttp('/api/now/cmdbquerybuilder/queries/' + api.context.props.queryStatusId + '/processStatus', {
                        method: 'GET'
                    })
                    .then(({
                        response
                    }) => {
                        if (response && response.result) {
                            const queryState = response.result;
                            if ('READY' != queryState && 'PROCESSING' != queryState && 'ERROR' != queryState) {
                                helpers.timing.clearInterval(isQueryLoadedPoller);
                                helpers.navigate.to(
                                    'smart-search-results', {
                                        table: api.context.props.table,
                                        listName: api.context.props.listName ? api.context.props.listName : "Smart search results"
                                    }, {
                                        savedQueryId: api.context.props.savedQueryId,
                                        queryStatusId: api.context.props.queryStatusId,
                                        queryState,
                                        nlqQueryLog: api.context.props.nlqQueryLog ? api.context.props.nlqQueryLog : "",
                                        encodedQuery: null
                                    },
                                    false,
                                    false,
                                    null,
                                    null,
                                    api.context.props.listName
                                );
                                helpers.timing.setTimeout(() => {
                                    api.setState('listRefresh', {
                                        timestamp: new Date()
                                    });
                                    api.setState('isLoading', false);
                                }, 1000);
                                api.setState('workerId', null);
                            } else if ('ERROR' == queryState) {
                                api.setState('showNlqSearchNotification', true);
                                api.setState('nlqSearchNotificationContent', genericErrorMsg);
                                console.error('Execute query failed');
                                _clearState();
                            }
                        }
                    })
                    .catch(({
                        error
                    }) => {
                        api.setState('showNlqSearchNotification', true);
                        api.setState('nlqSearchNotificationContent', genericErrorMsg);
                        api.setState('isLoading', false);
                        const message = `Error: ${error.data.error.message}`;
                        console.error(message);
                    });
            }, 2000);
        })
        .catch(({
            error
        }) => {
            api.setState('showNlqSearchNotification', true);
            api.setState('nlqSearchNotificationContent', genericErrorMsg);
            api.setState('isLoading', false);
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
        });
}
