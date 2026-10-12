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
    const DEFAULT_COMPOSITION =
        `<style>
            img{
                object-fit: contain;
                height: 245px;
                width: 100%;
            }
            p{
                margin: 0;
            }
        </style>`;
    if (productTourData.children[productTourIndex] &&
        productTourData.children[productTourIndex].props_details.composition)
        return DEFAULT_COMPOSITION + productTourData.children[productTourIndex].props_details.composition;
    return DEFAULT_COMPOSITION;
}
