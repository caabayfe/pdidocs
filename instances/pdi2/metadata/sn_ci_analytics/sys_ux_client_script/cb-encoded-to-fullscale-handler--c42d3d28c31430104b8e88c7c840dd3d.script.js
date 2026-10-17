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
    const {
        conditionBuilderRunClicked,
        getMinifiedComparisonModel
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    
    const _output = api.data.cb_encoded_to_fullscale_transformation.output;
    if (_output.success && _output.result) {
        const dbOutput = _output.result;
        const {
            isConditionBuilderModalOpen
        } = api.state;
        const query = conditionBuilderRunClicked(dbOutput);
        api.setState("comparisonModel", dbOutput);
        api.emit('VA_CONDITION_BUILDER#RUN_FILTER_CONDITIONS', {
            query
        });

        // Get rich text for condition preview component
        const {
            getPreviewData
        } = imports["sn_ci_analytics.VAConditionPreviewUtils"]();
        const richTextContent = getPreviewData(dbOutput);
        api.setState("richTextContent", richTextContent);

        api.setState('isFilterLoading', false);
        if (isConditionBuilderModalOpen) {
            const {
                isFilterLoading,
                selectedFilterId
            } = api.state;
            const {
                listType
            } = api.context.props;
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'condition_builder_modal',
                route: 'condition-builder-modal-content',
                fields: {
                    comparisonModel: JSON.parse(JSON.stringify(dbOutput)),
                    isFilterLoading: false,
                    listType,
                    selectedFilterId: selectedFilterId
                }
            });
        }
    }
}
