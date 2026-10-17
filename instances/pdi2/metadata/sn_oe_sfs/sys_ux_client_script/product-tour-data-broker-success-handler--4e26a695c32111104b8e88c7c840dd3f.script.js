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
    const productTourData = api.data.ci_product_tour_helper.output;
    api.setState('productTourData', {...productTourData});
    api.setState('productTourIndex', 0);
    if (!productTourData) return;

    //if url param has tour = active
    //open the modal as well
    if (api.context.props.tour === 'active') {
        helpers.modal.open('product_tour_modal', {});
    }
}
