/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    helpers.modal.close();
    const {
        comparisonModel,
        loadedFilterId
    } = event.payload;
    const {
        startDate,
        endDate,
        listType
    } = api.context.props;
    // Get query from comparisonModel 
    const {
        getMinifiedComparisonModel,
        conditionBuilderRunClicked
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();

    const {
        encodeVAURIQuery
    } = imports['sn_ci_analytics.VAConditionBuilderEncoderUtils']();

    const table = listType == 'conversation' ? 'va_conversations' : 'va_users';
    const query = conditionBuilderRunClicked(comparisonModel);

    // Set dropdown placeholder and selected item.
    if (loadedFilterId) {
        api.setState('selectedFilterId', loadedFilterId);
    } else {
        api.setState('selectedFilterId', '');
    }

    api.setState('comparisonModel', comparisonModel);
    api.setState('isConditionBuilderModalOpen', false);

    //resetting client state params for Encoded Query
    api.setState("vaConditionEncoded", null);
    api.setState("vaConditionTable", null);

    // Get rich text for condition preview component
    const {
        getPreviewData
    } = imports["sn_ci_analytics.VAConditionPreviewUtils"]();
    const richTextContent = getPreviewData(comparisonModel);
    api.setState("richTextContent", richTextContent);

    api.emit('VA_CONDITION_BUILDER#RUN_FILTER_CONDITIONS', {
        query
    });
    //Generate encoded query after button click and update the URL
    if (event.name == "VA_CONDITION_BUILDER#CONDITION_BUILDER_RUN_HANDLER") {
        const minifiedQuery = getMinifiedComparisonModel(comparisonModel);
        const createEncodedQuery = encodeVAURIQuery(minifiedQuery);
        api.setState("vaEncodedQueryGeneratedByCB", createEncodedQuery);
        helpers.navigate.setRouteParams({
            params: {
                startDate,
                endDate,
                encodedQuery: createEncodedQuery
            }
        });
    }
}
