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
    const {comparisonModel, isFilterLoading, selectedFilterId} = api.state;
    const {listType} = api.context.props;
    api.setState('isConditionBuilderModalOpen', true);
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'condition_builder_modal',
        route: 'condition-builder-modal-content',
        fields: {
            comparisonModel: JSON.parse(JSON.stringify(comparisonModel)),
            isFilterLoading,
            listType,
            selectedFilterId: selectedFilterId
        }
    });
}
