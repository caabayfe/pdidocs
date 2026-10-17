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

    const result = api.data.nlq_to_qb_rest.output.result;

    const { nlqQueryLogId, userQuestion, outputSource } = api.state;

    const _clearState = () => {
        helpers.timing.clearInterval(isQueryLoadedPoller);
        api.setState('isLoading', false);
        api.setState('workerId', null);
        api.setState('isQueryLoadedPoller', null);
    };

    // handle error checking
    if (!result) {
        api.setState('showNlqSearchNotification', true);
        api.setState('nlqSearchNotificationContent', genericErrorMsg);
        console.error('Execute query failed');
        _clearState();
        return;
    }
    if (result.status == 'FAILED') {
        if (result.worker_id == -1) {
            console.warn('Execute query failed - another query in progress');
            api.setState('nlqSearchNotificationContent', queryRunningWarningMsg);
        } else {
            console.error('Execute query failed');
            api.setState('nlqSearchNotificationContent', genericErrorMsg);

        }
        api.setState('showNlqSearchNotification', true);
        _clearState();
        return;
    }

    // valid qb query
    const resultTable = result.result_table;
    const savedQueryId = result.saved_query_id;
    const queryStatusId = result.query_status_id;

    // update workerId and queryStatusId to trigger cancel button
    api.setState('workerId', result.worker_id);
    api.setState('queryStatusId', queryStatusId);

    // get the current status of the query
    const isQueryLoadedPoller = helpers.timing.setInterval(() => {
        helpers.snHttp('/api/now/cmdbquerybuilder/queries/' + queryStatusId + '/processStatus', {
                method: 'GET'
            })
            .then(({
                response
            }) => {
                if (response && response.result && api.state.isLoading) {
                    const queryState = response.result;
                    if ('READY' != queryState && 'PROCESSING' != queryState && 'ERROR' != queryState) {
                        _clearState();
                        helpers.navigate.to(
                            'smart-search-results', {
                                table: resultTable,
                                listName: userQuestion ? userQuestion : "Intelligent search results"
                            }, {
                                savedQueryId,
                                queryStatusId,
                                queryState,
                                nlqQueryLog: nlqQueryLogId ? nlqQueryLogId : "",
                                encodedQuery: null,
                                modification: api.state.modifiedUtterance,
                                outputSource
                            },
                            false,
                            false,
                            null,
                            null,
                            userQuestion
                        );
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
                _clearState();
                const message = `Error: ${error.data.error.message}`;
                console.error(message);
            });
    }, 2000);

    api.setState('isQueryLoadedPoller', isQueryLoadedPoller);

    // clear stale nlq states
    api.setState('nlqQueryLogId', '');
    api.setState('userQuestion', '');
    api.setState('outputSource', '');

}
