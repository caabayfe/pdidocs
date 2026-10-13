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
        comparisonModel,
        listType,
        isFilterLoading,
        selectedFilterId
    } = api.context.props;

    const comparisonModelCopy = JSON.parse(JSON.stringify(comparisonModel));
    api.setState('comparisonModel', comparisonModelCopy);
    api.setState('cleanComparisonModelCopy', comparisonModelCopy);
    api.setState('isFilterLoading', isFilterLoading);
    api.setState('selectedFilterId', selectedFilterId);
    api.setState('bucketName', listType === 'conversation' ? 'va_conversations' : 'va_users');
}
