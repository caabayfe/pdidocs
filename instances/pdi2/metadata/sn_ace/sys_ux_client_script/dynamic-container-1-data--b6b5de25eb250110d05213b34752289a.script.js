/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let columns = api.context.props.payload.props_details.columns; // Ex: string in the format "6,3,3" (or) "3,4,5" (or) "3,3,3,3" == total 12
    const children = api.context.props.payload.children || [];

    if (!columns) {
        return [];
    }

    let colParts = [];
    try {
        colParts = columns.split(',').map(i => parseInt(i));
        const sum = colParts.reduce((a, b) => a + b, 0);
        if (sum < 12) {
            colParts.push(12 - sum); // pad with dummy area
        }
    } catch (e) {
        console.error('Unable to parse columns', e);
        return [];
    }

    const dynamicItems = children.map((item, i) => ({
        data: item,
        colSize: `${colParts[i % colParts.length]}`
    }));

    return dynamicItems;
}
