/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const {
        productType,
        isAddonProduct
    } = api.state;

    // false - show | true - hide. Hide the cards when this is an add-on product and the license type is 'Per-User'
    if (productType === 'Per-User' && isAddonProduct) {
        return true;
    } else {
        return false;
    }
}
