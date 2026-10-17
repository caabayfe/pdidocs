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
        column: columnKey
    } = api.context.props;
    const {
        columns = []
    } = api.data.controller.columnDefinitions || {};
    const column = columns.find(({
        key
    }) => key === columnKey);
    if (!column) return [];

    const {
        columnAggregatesInfo = []
    } = column.metadata || {};

    const aggregateSelections = {}
    const checklistItems = []

    columnAggregatesInfo.forEach(({ id, label, isSelected }) => {
        aggregateSelections[id] = isSelected;
        checklistItems.push({
            itemId: id,
            label,
            checked: isSelected,
        })
    });

    api.setState('aggregateSelections', aggregateSelections);
    api.setState('oldAggregateSelections', aggregateSelections);
    api.setState('checklistItems', checklistItems);
}
