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

    // only submit if at the end of the workflow
    if ((event.elementId.startsWith('submit') || api.state.feedback_sentiment === 'positive') &&
        api.context.props.nlqQueryLog) {

        const {
            saveNlqFeedbackError
        } = imports['sn_cmdb_ws.cmdbNlqSearchUtil']();
        const nlqFeedbackError = await saveNlqFeedbackError(helpers);

        // format payload
        const data = {};
        data.sysId = api.context.props.nlqQueryLog;
        data.feedbackSentiment = api.state.feedback_sentiment;
        if (api.state.feedback_sentiment === 'negative') {
            const categoryArray = api.state.feedback_categories_options
                .filter(option => option.checked)
                .map(selected => selected.itemId);
            data.feedbackProblemCategory = categoryArray.join(',');
            data.feedbackDetailed = api.state.feedback_details;
        }

        // save the data
        helpers.snHttp("/api/sn_cmdb_ws/cmdb_workspace_api_scoped/nlq_query_log", {
                method: "POST",
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((
                response
            ) => {
                console.log('Successfully saved nlq feedback data');
                // reset state
                api.setState('feedback_sentiment', '');
                api.setState('feedback_details', '');
                resetFeedbackSentimentRadio(api);
                resetFeedbackCategories(api);
            })
            .catch((
                error
            ) => {
                api.setState('showNlqSearchNotification', true);
                api.setState('nlqSearchNotificationContent', nlqFeedbackError);
                const message = `Error:  ${error.data ? error.data.error.message : error}`;
                console.error(message);
            });
    }

    function resetFeedbackSentimentRadio(api) {
        const feedbackSentimentArr = api.state.feedback_sentiment_options;
        feedbackSentimentArr.forEach(option => {
            delete option.checked;
        });
        api.setState('feedback_sentiment_options', feedbackSentimentArr);
    }

    function resetFeedbackCategories(api) {
        const feedbackCategoriesArr = api.state.feedback_categories_options;
        feedbackCategoriesArr.forEach(option => option.checked = false);
        api.setState('feedback_categories_options', feedbackCategoriesArr);
    }
}
