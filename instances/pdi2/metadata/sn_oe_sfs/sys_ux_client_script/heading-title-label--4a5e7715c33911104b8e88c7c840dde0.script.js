/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        productTourData,
        productTourIndex
    } = api.state;
    if (productTourData.children[productTourIndex] &&
        productTourData.children[productTourIndex].title)
        return productTourData.children[productTourIndex].title;
    return '';
}
