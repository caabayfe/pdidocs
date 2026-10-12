/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.app.activityStreamProps) {
        var props = JSON.parse(api.context.app.activityStreamProps);
        props.tags = props.tags.map(tag => ({
            ...tag,
            id: tag.label,
            tables: tag.tables.map(table => ({
                id: table,
                label: table
            }))
        }));
        return props.tags;
    }
    return [];
}
