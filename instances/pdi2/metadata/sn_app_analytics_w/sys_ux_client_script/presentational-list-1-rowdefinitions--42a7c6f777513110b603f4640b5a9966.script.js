/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const output = api.data.get_visualizations.output;
    if (!output) return {};
    const result = output.result;
    if (!result || !result.items || !result.items.length) {
        return {};
    }

    const items = result.items;
    const rows = [];

    for (let i = 0; i < items.length; i++) {
        rows.push({
            key: items[i]['viz-id'],
            cells: {
                name: {
                    label: items[i]['name'],
                    value: items[i]['name'],
                    sys_id: items[i]['viz-id'],
                    origin: items[i]['origin']
                },
                type: {
                    value: items[i]['type']
                },
                description: {
                    value: items[i]['description']
                },
                createdBy: {
                    value: items[i]['created-by']
                },
                updated: {
                    value: items[i]['updated']
                },
            }
        });
    }

    return {
        rows: rows
    };
}
