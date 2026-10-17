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
    const {
        startDate,
        endDate,
        listType
    } = api.context.props;
    switch (event.name) {
        case 'NOW_DROPDOWN#ITEM_CLICKED':
            {
                const filterId = event.payload.item.id;
                api.setState('selectedFilterId', filterId);
                api.setState('isFilterLoading', true);
                api.setState('filterSetByUI', true);
                api.data.load_filter.execute({
                    filterId,
                    listType
                });
                break;
            }

        case 'DATA_OP_SUCCEEDED':
            {
                const {
                    conditionBuilderRunClicked,
                    getMinifiedComparisonModel
                } =
                imports['sn_ci_analytics.VAConditionBuilderUtils']();
                const {
                    getPreviewData
                } =
                imports['sn_ci_analytics.VAConditionPreviewUtils']();
                const {
                    encodeVAURIQuery
                } = imports['sn_ci_analytics.VAConditionBuilderEncoderUtils']();
                const comparisonModel = event.payload.data.output;
                const {
                    isConditionBuilderModalOpen,
                    selectedFilterId
                } = api.state;
                api.setState('comparisonModel', comparisonModel);
                api.setState('isFilterLoading', false);

                // Update modal if open
                if (isConditionBuilderModalOpen) {
                    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                        viewportElementId: 'condition_builder_modal',
                        route: 'condition-builder-modal-content',
                        fields: {
                            comparisonModel: JSON.parse(JSON.stringify(comparisonModel)),
                            isFilterLoading: false,
                            listType,
                            selectedFilterId: selectedFilterId
                        }
                    });
                }

                // Get rich text for condition preview component
                const richTextContent = getPreviewData(comparisonModel);
                api.setState('richTextContent', richTextContent);

                // Get minifiedQuery and update list
                const query = conditionBuilderRunClicked(comparisonModel);
                api.emit('VA_CONDITION_BUILDER#RUN_FILTER_CONDITIONS', {
                    query,
                });

                //clear encoded query
                //api.setState('vaConditionEncoded', '');
                //api.setState('vaConditionTable', '');
                const minifiedQuery = getMinifiedComparisonModel(comparisonModel);
                const filterSetByUI = api.state.filterSetByUI;
                api.setState('filterSetByUI', false);

                //If the filter is not set by UI, do not encode
                if (!filterSetByUI) return;

                const createEncodedQuery = encodeVAURIQuery(minifiedQuery);
                api.setState("vaEncodedQueryGeneratedByCB", createEncodedQuery);
                helpers.navigate.setRouteParams({
                    params: {
                        startDate,
                        endDate,
                        encodedQuery: createEncodedQuery
                    }
                });
                break;
            }
    }
}
