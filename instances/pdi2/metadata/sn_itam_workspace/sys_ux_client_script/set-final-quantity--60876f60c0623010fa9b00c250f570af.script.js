/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var qty = api.state.tempQuantity;

    if(!qty || qty < 0) {
        helpers.translate("Please enter a non-zero number for quantity").then(
            (value) => {
                api.setState('errorMessage', value);
            }
        );
    } else if (qty == 0) {
        helpers.translate("Please enter a non-zero number for quantity").then(
            (value) => {
                api.setState('errorMessage', value);
            }
        );
    } else if (qty >= api.state.maxQuantity) {
        helpers.translate("Please enter a quantity less than or equal to quantity in stock").then(
            (value) => {
                api.setState('errorMessage', value);
            }
        );
    } else {
        api.setState('quantity', qty);
    }
}
