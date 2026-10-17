/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const columns = api.data.list_controller_3.columnDefinitions.columns;
    
    let result = [];

    columns.forEach(column => {
        if (column.key === 'audit_retention' && column.choices && Array.isArray(column.choices)) {
            column.choices.slice(1).forEach(choice => {
                result.push({
                    id: choice.key,
                    label: choice.label
                });
            });
        }
    });

    return result;
}
